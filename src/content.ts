// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { NIP_07_APIS, getURLList } from './common';

// ask `background.ts` to inject `inject.ts` to the page.
// TODO: this sendMessage will be removed when Chrome 111 is released (it's beta right now).
// this is `Method 4` of this post but `Method 5` is rather simple and clean (but requires Chrome 111+).
// https://stackoverflow.com/a/9517879

(async () => {
  const urlList = await getURLList();
  if (urlList.includes(window.location.origin)) {
    const response = await chrome.runtime.sendMessage({ id: crypto.randomUUID(), method: 'inject', params: {} });
    if (chrome.runtime.lastError) console.debug('content.ts: inject: lastError', chrome.runtime.lastError);
    console.debug('content.ts: inject: response', response);
    // proxy request from `inject.ts` to `background.ts` and response from `background.ts` to `inject.ts`.
    window.addEventListener('message', async (ev: MessageEvent) => { // receive from `inject.ts`
      if (!(ev.origin === window.location.origin &&
            ev.data && ev.data.id && ev.data.method &&
            NIP_07_APIS.includes(ev.data.method))) return;
      const response = await chrome.runtime.sendMessage(ev.data); // send to `background.ts`
      if (chrome.runtime.lastError) console.debug('content.ts: message: lastError', chrome.runtime.lastError);
      console.debug('content.ts: message: response', response);
      window.postMessage(response, window.location.origin); // send to `inject.ts`
    });
  }
})();
