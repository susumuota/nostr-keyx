// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// https://github.com/nostr-protocol/nips/blob/master/07.md

// use secp.utils.bytesToHex, secp.utils.sha256, secp.schnorr.sign, secp.getSharedSecret
import * as secp from '@noble/secp256k1';
import { base64 } from '@scure/base';

// Event object.
// https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
type Event = {
  id?: string,
  sig?: string,
  kind: number,
  tags: string[][],
  pubkey: string,
  content: string,
  created_at: number
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getPrivateKey = async () => (
  (await chrome.storage.local.get('privateKey'))['privateKey'] as string
);

const getPublicKey = async () => (
  (await chrome.storage.local.get('publicKey'))['publicKey'] as string
);

const getRelays = async () => (
  ((await chrome.storage.local.get('relays'))['relays'] ?? {}) as object
);

// NIP-04 encryption for direct messages.
// https://github.com/nostr-protocol/nips/blob/master/04.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip04.ts
const nip04encrypt = async (privkey: string, pubkey: string, text: string) => {
  const key = secp.getSharedSecret(privkey, '02' + pubkey);
  const normalizedKey = key.slice(1, 33);
  const iv = Uint8Array.from(crypto.getRandomValues(new Uint8Array(16)));
  const plaintext = encoder.encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', normalizedKey, { name: 'AES-CBC' }, false, ['encrypt']
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv }, cryptoKey, plaintext
  );
  const ctb64 = base64.encode(new Uint8Array(ciphertext));
  const ivb64 = base64.encode(new Uint8Array(iv.buffer));
  return `${ctb64}?iv=${ivb64}`;
};

// NIP-04 decryption for direct messages.
// https://github.com/nostr-protocol/nips/blob/master/04.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip04.ts
const nip04decrypt = async (privkey: string, pubkey: string, data: string) => {
  const [ctb64, ivb64] = data.split('?iv=');
  if (!ctb64 || !ivb64) throw new Error('invalid data');
  const key = secp.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = key.slice(1, 33);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', normalizedKey, { name: 'AES-CBC' }, false, ['decrypt']
  );
  const ciphertext = base64.decode(ctb64);
  const iv = base64.decode(ivb64);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv }, cryptoKey, ciphertext
  );
  return decoder.decode(plaintext);
};

// NIP-07 API method names.
// https://github.com/nostr-protocol/nips/blob/master/07.md
const NIP_07_APIS = ['getPublicKey', 'signEvent', 'getRelays', 'nip04.encrypt', 'nip04.decrypt'];

// receive requests from `content.ts` and send responses to `content.ts`.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.debug('background.ts: onMessage: request', request);
    console.debug('background.ts: onMessage: sender', sender);

    // check request type
    const { id, type, arg }: { id: string, type: string, arg: any } = request;
    if (!(NIP_07_APIS.includes(type) || type === 'inject')) {
      sendResponse({ id, type: 'error', result: 'unknown type' });
      return true;
    }
    const responseType = [...type].reverse().join(''); // see inject.ts

    // inject `inject.ts` to the page (e.g. iris, snort, etc.) to provide `window.nostr`.
    // TODO: this executeScript will be removed when Chrome 111 is released (it's beta right now).
    // this is `Method 4` of this post but `Method 5` is rather simple and clean (but requires Chrome 111+).
    // https://stackoverflow.com/a/9517879
    if (type === 'inject' && sender.tab?.id) {
      const tabId = sender.tab.id;
      (async () => {
        const results = await chrome.scripting.executeScript({
          target: { tabId }, world: 'MAIN', files: ['inject.js'] // world: 'MAIN' is important
        });
        sendResponse({ id, type: responseType, result: results });
      })();
      return true;
    }

    // NIP-07 API handlers
    // https://github.com/nostr-protocol/nips/blob/master/07.md
    if (type === 'getPublicKey') {
      (async () => {
        sendResponse({ id, type: responseType, result: await getPublicKey() })
      })();
    } else if (type === 'signEvent') {
      (async () => {
        const { event }: { event: Event } = arg;
        event.pubkey = await getPublicKey();
        const json = JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]);
        event.id = secp.utils.bytesToHex(await secp.utils.sha256(encoder.encode(json)));
        event.sig = secp.utils.bytesToHex(await secp.schnorr.sign(event.id, await getPrivateKey()));
        // console.assert(await secp.schnorr.verify(event.sig, event.id, event.pubkey));
        sendResponse({ id, type: responseType, result: event });
      })();
    } else if (type === 'getRelays') {
      (async () => {
        sendResponse({ id, type: responseType, result: await getRelays() })
      })();
    } else if (type === 'nip04.encrypt') {
      (async () => {
        const { pubkey, plaintext }: { pubkey: string, plaintext: string } = arg;
        const ciphertext = await nip04encrypt(await getPrivateKey(), pubkey, plaintext);
        // console.assert(plaintext === await nip04decrypt(await getPrivateKey(), pubkey, ciphertext));
        sendResponse({ id, type: responseType, result: ciphertext });
      })();
    } else if (type === 'nip04.decrypt') {
      (async () => {
        const { pubkey, ciphertext }: { pubkey: string, ciphertext: string } = arg;
        const plaintext = await nip04decrypt(await getPrivateKey(), pubkey, ciphertext);
        sendResponse({ id, type: responseType, result: plaintext });
      })();
    }

  } catch (err) {
    sendResponse({ id: request.id, type: 'error', result: err });
  }

  return true;
});
