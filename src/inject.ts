// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

(() => {

  // Event object.
  // https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
  type Event = {
    id?: string,
    sig?: string,
    kind: number,
    tags: string[][],
    pubkey: string,
    content: string,
    created_at: number
  }

  // send the api request to `content.ts`, receive the response, and return it, asynchronously.
  const api = (type: string, arg: any) => {
    return new Promise<any>((resolve, reject) => {
      const id = crypto.randomUUID();
      const listener = (ev: MessageEvent) => { // receive response from `content.ts`
        if (!(ev.origin === window.location.origin && ev.data.id === id && ev.data.type !== type)) return;
        window.removeEventListener('message', listener);
        const responseType = [...type].reverse().join(''); // see background.ts
        (ev.data.type === responseType ? resolve : reject)(ev.data.result); // return response
      };
      window.addEventListener('message', listener);
      window.postMessage({ id, type, arg }, window.location.origin); // send request to `content.ts`
    });
  };

  // provide NIP-07 API to the page.
  // @ts-ignore
  window.nostr = {
    getPublicKey: async (): Promise<string> => api('getPublicKey', {}),
    signEvent: async (event: Event): Promise<Event> => api('signEvent', { event }),
    getRelays: async (): Promise<any> => api('getRelays', {}),
    nip04: {
      encrypt: async (pubkey: string, plaintext: string): Promise<string> => api('nip04.encrypt', { pubkey, plaintext }),
      decrypt: async (pubkey: string, ciphertext: string): Promise<string> => api('nip04.decrypt', { pubkey, ciphertext }),
    }
  };

  return true;
})();
