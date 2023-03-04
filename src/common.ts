// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// NIP-07 API method names.
// https://github.com/nostr-protocol/nips/blob/master/07.md
const NIP_07_APIS = ['getPublicKey', 'signEvent', 'getRelays', 'nip04.encrypt', 'nip04.decrypt'];

const DEFAULT_ACCOUNT = 'default';
const DEFAULT_URL_LIST = ['https://iris.to', 'https://snort.social', 'http://localhost'];

const getAccount = async () => {
  const nostr_keyx = (await chrome.storage.sync.get('nostr-keyx'))['nostr-keyx'] as string;
  if (!nostr_keyx) return DEFAULT_ACCOUNT;
  const json = JSON.parse(nostr_keyx);
  return json?.state?.account as string ?? DEFAULT_ACCOUNT;
};

const getURLList = async () => {
  const nostr_keyx = (await chrome.storage.sync.get('nostr-keyx'))['nostr-keyx'] as string;
  if (!nostr_keyx) return DEFAULT_URL_LIST;
  const json = JSON.parse(nostr_keyx);
  return json?.state?.urlList as string[] ?? DEFAULT_URL_LIST;
};

export { NIP_07_APIS, DEFAULT_ACCOUNT, DEFAULT_URL_LIST, getAccount, getURLList };
