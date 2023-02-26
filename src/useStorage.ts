// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';

const useStorage = <T,>(key: string, initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    (async () => {
      const s = (await chrome.storage.sync.get(key))[key];
      if (s !== undefined) setState(s as T); // TODO: is undefined check necessary?
    })();
  }, []);

  useEffect(() => {
    if (state !== undefined) { // TODO: is undefined check necessary?
      (async () => {
        await chrome.storage.sync.set({ [key]: state });
      })();
    }
  }, [state]);

  return [state, setState];
};

export { useStorage };
