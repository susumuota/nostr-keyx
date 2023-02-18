// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// https://developer.chrome.com/docs/apps/nativeMessaging/
// https://dev.classmethod.jp/articles/chrome-native-message/

// account should be set by `popup.tsx`.
const getAccount = async () => (
  (await chrome.storage.local.get('account'))['account'] as string ?? 'default'
);

// NIP-07 API method names.
// https://github.com/nostr-protocol/nips/blob/master/07.md
const NIP_07_APIS = ['getPublicKey', 'signEvent', 'getRelays', 'nip04.encrypt', 'nip04.decrypt'];

// connect to `nostr_keyx` native app.
let nativePort: chrome.runtime.Port;
try {
  nativePort = chrome.runtime.connectNative('io.github.susumuota.nostr_keyx');
} catch (err) {
  console.error('background.ts: nativePort error', err);
  throw err;
}

// reconnect `nostr_keyx` native app when it's disconnected.
nativePort.onDisconnect.addListener(() => {
  if (chrome.runtime.lastError) {
    console.error('background.ts: nativePort.onDisconnect: lastError', chrome.runtime.lastError);
  }
  nativePort = chrome.runtime.connectNative('io.github.susumuota.nostr_keyx');
  console.debug('background.ts: nativePort', nativePort);
});

// receive requests from `content.ts` and send responses to `content.ts`.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('background.ts: onMessage: request', request);

  // check request type
  const { id, type }: { id: string, type: string } = request;
  if (!(id && NIP_07_APIS.includes(type) || type === 'inject')) {
    sendResponse({ id, type: 'error', result: 'unknown type' });
    return true;
  }

  // inject `inject.ts` to the page (e.g. iris, snort, etc.) to provide `window.nostr`.
  // TODO: this executeScript will be removed when Chrome 111 is released (it's beta right now).
  // this is `Method 4` of this post but `Method 5` is rather simple and clean (but requires Chrome 111+).
  // https://stackoverflow.com/a/9517879
  if (type === 'inject') {
    if (!(sender.tab && sender.tab.id)) {
      sendResponse({ id, type: 'error', result: 'no tab' });
      return true;
    }
    const tabId = sender.tab.id;
    (async () => {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId }, world: 'MAIN', files: ['inject.js'] // world: 'MAIN' is important
        });
        const responseType = [...type].reverse().join(''); // see inject.ts
        sendResponse({ id, type: responseType, result: results });
      } catch (err) {
        console.error('background.ts: onMessage: injection error', err);
        sendResponse({ id, type: 'error', result: err });
      }
    })();
    return true;
  }


  // send request to `nostr_keyx` native app.
  // `sendNativeMessage` also work, but it spawns a node process every call, which is very slow.
  // native port spawns a node process only once, which is much faster.
  try {
    const listener = (response: any) => {
      if (response.id !== id) return;
      nativePort.onMessage.removeListener(listener);
      console.debug('background.ts: onMessage: response', response);
      sendResponse(response);
    };
    nativePort.onMessage.addListener(listener);
    (async () => {
      // append account to the request
      nativePort.postMessage({...request, account: await getAccount()});
    })();
  } catch (err) {
    console.error('background.ts: onMessage: nativePort error', err);
    sendResponse({ id, type: 'error', result: err });
  }

  return true;
});

export {} // TODO
