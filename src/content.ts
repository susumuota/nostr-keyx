// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// ask `background.ts` to inject `inject.ts` to the page.
// TODO: this sendMessage will be removed when Chrome 111 is released (it's beta right now).
// this is `Method 4` of this post but `Method 5` is rather simple and clean (but requires Chrome 111+).
// https://stackoverflow.com/a/9517879
chrome.runtime.sendMessage({ id: 'inject', type: 'inject', arg: {} }, (response) => {
  console.debug('content.ts: inject: response', response);
});

const NIP_07_APIS = ['getPublicKey', 'signEvent', 'getRelays', 'nip04.encrypt', 'nip04.decrypt'];

// proxy request from `inject.ts` to `background.ts` and response from `background.ts` to `inject.ts`.
window.addEventListener('message', async (ev: MessageEvent) => { // receive from `inject.ts`
  if (!(ev.origin === window.location.origin && NIP_07_APIS.includes(ev.data.type))) return;
  chrome.runtime.sendMessage(ev.data, (response) => { // send to / receive from `background.ts`
    window.postMessage(response, window.location.origin); // send to `inject.ts`
  });
});
