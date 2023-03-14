// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { NIP_07_APIS } from './common';

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
