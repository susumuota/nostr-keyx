// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

type Store = {
  account: string;
  accountList: string[];
  message: string;
  isSnackbar: boolean;
  isDrawer: boolean;
  isDialog: boolean;
  setAccount: (account: string) => void;
  setAccountList: (accountList: string[]) => void;
  setMessage: (message: string) => void;
  setSnackbar: (isSnackbar: boolean) => void;
  showMessage: (message: string) => void;
  setDrawer: (isDrawer: boolean) => void;
  setDialog: (isDialog: boolean) => void;
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
const useStore = create<Store>()(persist((set) => ({
  account: 'default',
  accountList: ['default'],
  message: '',
  isSnackbar: false,
  isDrawer: false,
  isDialog: false,
  setAccount: (account: string) => set({ account }),
  setAccountList: (accountList: string[]) => set({ accountList }),
  setMessage: (message: string) => set({ message }),
  setSnackbar: (isSnackbar: boolean) => set({ isSnackbar }),
  showMessage: (message: string) => set({ message, isSnackbar: true, isDrawer: false, isDialog: false }),
  setDrawer: (isDrawer: boolean) => set({ isDrawer }),
  setDialog: (isDialog: boolean) => set({ isDialog }),
}), {
  name: 'nostr-keyx',
  version: 1,
  storage: createJSONStorage(() => chromeStorageSync),
  partialize: (state) => ({ account: state.account, accountList: state.accountList }),
}));

export { useStore };
