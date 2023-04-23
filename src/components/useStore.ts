// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { Relay } from '../common';
import { DEFAULT_ACCOUNT, DEFAULT_URL_LIST, DEFAULT_RELAY_LIST } from '../common';

type Store = {
  account: string;
  accountList: string[];
  urlList: string[];
  relayList: Relay[];
  message: string;
  isSnackbar: boolean;
  setAccount: (account: string) => void;
  addAccount: (account: string) => void;
  deleteAccount: (account: string) => void;
  addURL: (url: string) => void;
  deleteURL: (url: string) => void;
  restoreURLList: () => void;
  getRelay: (url: string) => Relay | undefined; // TODO: null?
  setRelay: (url: string, read: boolean, write: boolean) => void;
  toggleReadRelay: (url: string) => void;
  toggleWriteRelay: (url: string) => void;
  addRelay: (url: string, read: boolean, write: boolean) => void;
  deleteRelay: (url: string) => void;
  clearRelayList: () => void;
  restoreRelayList: () => void;
  setSnackbar: (isSnackbar: boolean) => void;
  showMessage: (message: string) => void;
}

// https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#how-can-i-use-a-custom-storage-engine
const chromeStorageSync: StateStorage = { // TODO: PersistStorage
  getItem: async (name: string) => (
    (await chrome.storage.sync.get(name))[name] || null
  ),
  setItem: async (name: string, value: string) => (
    await chrome.storage.sync.set({ [name]: value })
  ),
  removeItem: async (name: string) => (
    await chrome.storage.sync.remove(name)
  ),
}

// https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#how-do-i-use-it-with-typescript
const useStore = create<Store>()(persist((set, get) => ({
  account: DEFAULT_ACCOUNT,
  accountList: [DEFAULT_ACCOUNT],
  urlList: DEFAULT_URL_LIST,
  relayList: DEFAULT_RELAY_LIST,
  message: '',
  isSnackbar: false,
  // TODO: if account is not in accountList, add it or throw error or just ignore?
  setAccount: (account: string) => set({ account }),
  addAccount: (account: string) => set(state => ({
    account,
    accountList: [...state.accountList, account],
  })),
  deleteAccount: (account: string) => set(state => ({
    account: DEFAULT_ACCOUNT,
    accountList: state.accountList.filter(a => a !== account),
  })),
  addURL: (url: string) => set(state => ({
    urlList: [...state.urlList, url],
  })),
  deleteURL: (url: string) => set(state => ({
    urlList: state.urlList.filter(u => u !== url),
  })),
  restoreURLList: () => set({ urlList: DEFAULT_URL_LIST }),
  getRelay: (url: string) => get().relayList.find(r => r.url === url),
  setRelay: (url: string, read: boolean, write: boolean) => set(state => ({
    relayList: state.relayList.map(r => r.url === url ? { url, policy: { read, write } } as Relay : r),
  })),
  toggleReadRelay: (url: string) => set(state => ({
    relayList: state.relayList.map(r => r.url === url ? { url, policy: { read: !r.policy.read, write: r.policy.write } } as Relay : r),
  })),
  toggleWriteRelay: (url: string) => set(state => ({
    relayList: state.relayList.map(r => r.url === url ? { url, policy: { read: r.policy.read, write: !r.policy.write } } as Relay : r),
  })),
  addRelay: (url: string, read: boolean, write: boolean) => set(state => ({
    relayList: [...state.relayList, { url, policy: { read, write } } as Relay],
  })),
  deleteRelay: (url: string) => set(state => ({
    relayList: state.relayList.filter(r => r.url !== url),
  })),
  clearRelayList: () => set({ relayList: [] }),
  restoreRelayList: () => set({ relayList: DEFAULT_RELAY_LIST }),
  setSnackbar: (isSnackbar: boolean) => set({ isSnackbar }),
  showMessage: (message: string) => set({ message, isSnackbar: true }),
}), {
  name: 'nostr-keyx',
  version: 1,
  storage: createJSONStorage(() => chromeStorageSync),
  partialize: (state) => ({
    account: state.account,
    accountList: state.accountList,
    urlList: state.urlList,
    relayList: state.relayList,
  }),
}));

export { useStore };
