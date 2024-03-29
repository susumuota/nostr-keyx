// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// https://developer.chrome.com/docs/apps/nativeMessaging/
// https://dev.classmethod.jp/articles/chrome-native-message/

import type { Relay, NIP07Relay } from './common';
import { NIP_07_APIS, getAccount, getURLList, getRelayList } from './common';

const setBadge = (text: string, color: string) => {
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
};

// connect to `nostr_keyx` native messaging host.
let nativePort: chrome.runtime.Port | null;
nativePort = chrome.runtime.connectNative('io.github.susumuota.nostr_keyx');

// if `nostr_keyx` native app is not installed, show error message and set badge color to red.
nativePort.onDisconnect.addListener(() => {
  if (chrome.runtime.lastError) {
    console.log('background.ts: nativePort.onDisconnect:', chrome.runtime.lastError.message);
    setBadge('!', 'red');
    chrome.tabs.create({ url: 'notice.html' });
  }
  nativePort = null;
});

// TODO: need more sophisticated API usage stats?
let count = 0;

// receive requests from `content.ts` and send responses to `content.ts`.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    console.debug('background.ts: onMessage: request', request);
    // console.debug('background.ts: onMessage: sender', sender);

    const send = (response: any) => {
      (response.error ? console.log : console.debug)('background.ts: onMessage: response', response);
      if (['signEvent', 'nip04.encrypt', 'nip04.decrypt'].includes(request.method)) count += 1;
      count = count % 10;
      response.error ? setBadge('!', 'red') : setBadge(count.toString(), 'white');
      sendResponse(response);
    };

    // check request method
    const { id, method }: { id: string, method: string } = request;
    if (!(id && NIP_07_APIS.includes(method))) {
      send({ id, result: null, error: 'invalid method' });
      return true;
    }

    // check sender
    if (!sender.origin) {
      send({ id, result: null, error: 'no origin' });
      return true;
    }
    const urlList = await getURLList();
    if (!urlList.includes(sender.origin)) {
      send({ id, result: null, error: 'invalid origin' });
      const sp = new URLSearchParams({ origin: sender.origin });
      const url = `prompt.html?${sp.toString()}`;
      const absUrl = `chrome-extension://${chrome.runtime.id}/${url}`;
      // check if the tab is already opened
      const [tab] = await chrome.tabs.query({ url: absUrl });
      if (tab && tab.id) {
        // TODO: this might be annoying if the nostr client keeps sending requests.
        // await chrome.tabs.update(tab.id, { active: true });
        return true;
      }
      await chrome.tabs.create({ url });
      return true;
    }

    // handle only `getRelays` method
    if (method === 'getRelays') {
      const relayList = await getRelayList();
      const relays: NIP07Relay = {};
      relayList.forEach((r: Relay) => {
        relays[r.url] = { read: r.policy.read, write: r.policy.write };
      });
      send({ id, result: relays, error: null });
      return true;
    }

    // send request to `nostr_keyx` native app.
    if (!nativePort) {
      send({ id, result: null, error: 'no nativePort' });
      return true;
    }
    const listener = (response: any) => {
      if (response.id !== id) return;
      nativePort?.onMessage.removeListener(listener);
      send(response);
    };
    nativePort.onMessage.addListener(listener);
    // append account to the request
    nativePort.postMessage({...request, account: await getAccount()});
    return true;
  })();
  return true;
});

export {} // TODO
