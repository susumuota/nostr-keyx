// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

(() => {

  // send the api request to `content.ts`, receive the response, and return it, asynchronously.
  const api = (method: string, params: any) => {
    return new Promise<any>((resolve, reject) => {
      const id = crypto.randomUUID();
      const listener = (ev: MessageEvent) => { // receive response from `content.ts`
        if (!(ev.origin === window.location.origin &&
              ev.data && ev.data.id === id &&
              !('method' in ev.data))) return; // if there is method, it should be request not response
        window.removeEventListener('message', listener);
        ev.data.error ? reject(ev.data.error) : resolve(ev.data.result); // return response
      };
      window.addEventListener('message', listener);
      window.postMessage({ id, method, params }, window.location.origin); // send request to `content.ts`
    });
  };

  // provide NIP-07 API to the page.
  // @ts-ignore
  window.nostr = {
    getPublicKey: async (): Promise<string> => api('getPublicKey', {}),
    signEvent: async (event: any): Promise<any> => api('signEvent', { event }),
    getRelays: async (): Promise<any> => api('getRelays', {}),
    nip04: {
      encrypt: async (pubkey: string, plaintext: string): Promise<string> => api('nip04.encrypt', { pubkey, plaintext }),
      decrypt: async (pubkey: string, ciphertext: string): Promise<string> => api('nip04.decrypt', { pubkey, ciphertext }),
    }
  };

  return true;
})();
