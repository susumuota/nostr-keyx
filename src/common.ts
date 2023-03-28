// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// https://github.com/fiatjaf/nos2x/blob/master/extension/options.jsx
// Relay[] is easier to handle than NIP07Relay.
type Relay = {
  url: string;
  policy: {
    read: boolean;
    write: boolean;
  };
};

// https://github.com/nostr-protocol/nips/blob/master/07.md
// this is an official type definition, but it is troublesome to handle.
// NIP07Relay is only used to copy to / paste from clipboard.
type NIP07Relay = {
  [url: string]: {
    read: boolean,
    write: boolean
  }
};

// NIP-07 API method names.
// https://github.com/nostr-protocol/nips/blob/master/07.md
const NIP_07_APIS = ['getPublicKey', 'signEvent', 'getRelays', 'nip04.encrypt', 'nip04.decrypt'];

const DEFAULT_ACCOUNT = 'default';

const DEFAULT_URL_LIST = ['https://snort.social', 'https://iris.to', 'https://app.coracle.social'];

// free (Damus, Snort, Iris, Amethyst, Coracle) + paid (wine + nostrich) + blastr (write only) + search
// confirmed: 2023-03-28
// https://snort.social/e/note1ukmaarf2t9dkhxkphwh4sv4qsrtnvxwz09wmfpgsujwh3m48h8gstyef2f
// https://github.com/MutinyWallet/blastr
const DEFAULT_RELAY_LIST: Relay[] = [
  { url: 'wss://relay.damus.io',         policy: { read: true,  write: true  } },  // free, Damus,        Iris, Amethyst, Coracle
  { url: 'wss://nos.lol',                policy: { read: true,  write: true  } },  // free, Damus, Snort, Iris, Amethyst
  { url: 'wss://relay.snort.social',     policy: { read: true,  write: true  } },  // free, Snort,        Iris, Amethyst
  { url: 'wss://nostr.wine',             policy: { read: true,  write: false } },  // paid, Damus, Snort,       Amethyst
  { url: 'wss://relay.nostrich.land',    policy: { read: true,  write: false } },  // paid,
  { url: 'wss://universe.nostrich.land', policy: { read: true,  write: false } },  // paid, for global, you can append `?lang=en&lang=ja`
  { url: 'wss://nostr.mutinywallet.com', policy: { read: false, write: true  } },  // free, write only, publishes to all known online relays
  { url: 'wss://relay.nostr.band',       policy: { read: false, write: false } },  // free, search, turn `read` on when you search
];

// https://github.com/damus-io/damus/blob/159d0fa2b59103a774c9b1acf4146bc01474245f/damus/ContentView.swift#L11
// confirmed: 2023-03-28
const DAMUS_RELAY_LIST: Relay[] = [
  { url: 'wss://relay.damus.io',  policy: { read: true, write: true } },
  { url: 'wss://eden.nostr.land', policy: { read: true, write: true } },  // paid
  { url: 'wss://nostr.wine',      policy: { read: true, write: true } },  // paid
  { url: 'wss://nos.lol',         policy: { read: true, write: true } },
];

// https://github.com/v0l/snort/blob/29f17e6247801a4fa0612021ea14a42f421be4f0/packages/app/src/Const.ts#L41
// confirmed: 2023-03-28
const SNORT_RELAY_LIST: Relay[] = [
  { url: 'wss://relay.snort.social', policy: { read: true, write: true  } },
  { url: 'wss://nostr.wine',         policy: { read: true, write: false } },  // paid
  { url: 'wss://nos.lol',            policy: { read: true, write: false } },
];

// https://github.com/irislib/iris-messenger/blob/aeb5c697945471deb0d2b3e2fd67059e325cab89/src/js/nostr/Relays.ts#L19
// confirmed: 2023-03-28
const IRIS_RELAY_LIST: Relay[] = [
  { url: 'wss://eden.nostr.land',         policy: { read: true, write: true } },  // paid
  { url: 'wss://nostr.fmt.wiz.biz',       policy: { read: true, write: true } },
  { url: 'wss://relay.damus.io',          policy: { read: true, write: true } },
  { url: 'wss://nostr-pub.wellorder.net', policy: { read: true, write: true } },
  { url: 'wss://relay.nostr.info',        policy: { read: true, write: true } },
  { url: 'wss://offchain.pub',            policy: { read: true, write: true } },
  { url: 'wss://nos.lol',                 policy: { read: true, write: true } },
  { url: 'wss://brb.io',                  policy: { read: true, write: true } },
  { url: 'wss://relay.snort.social',      policy: { read: true, write: true } },
  { url: 'wss://relay.current.fyi',       policy: { read: true, write: true } },
  { url: 'wss://nostr.relayer.se',        policy: { read: true, write: true } },
  { url: 'wss://relay.nostr.band',        policy: { read: true, write: true } },  // search
];

// https://github.com/vitorpamplona/amethyst/blob/5ce35363d9023f415fbb71cb5007f2cf08a0eed0/app/src/main/java/com/vitorpamplona/amethyst/service/relays/Constants.kt#L16
// confirmed: 2023-03-28
const AMETHYST_RELAY_LIST: Relay[] = [
  { url: 'wss://nostr.bitcoiner.social',  policy: { read: true, write: true  } },
  { url: 'wss://relay.nostr.bg',          policy: { read: true, write: true  } },
  { url: 'wss://relay.snort.social',      policy: { read: true, write: true  } },
  { url: 'wss://relay.damus.io',          policy: { read: true, write: true  } },
  { url: 'wss://nostr.oxtr.dev',          policy: { read: true, write: true  } },
  { url: 'wss://nostr-pub.wellorder.net', policy: { read: true, write: true  } },
  { url: 'wss://nostr.mom',               policy: { read: true, write: true  } },
  { url: 'wss://no.str.cr',               policy: { read: true, write: true  } },
  { url: 'wss://nos.lol',                 policy: { read: true, write: true  } },
  { url: 'wss://relay.nostr.com.au',      policy: { read: true, write: false } },  // paid
  { url: 'wss://eden.nostr.land',         policy: { read: true, write: false } },  // paid
  { url: 'wss://nostr.milou.lol',         policy: { read: true, write: false } },  // paid
  { url: 'wss://puravida.nostr.land',     policy: { read: true, write: false } },  // paid
  { url: 'wss://nostr.wine',              policy: { read: true, write: false } },  // paid
  { url: 'wss://nostr.inosta.cc',         policy: { read: true, write: false } },  // paid
  { url: 'wss://atlas.nostr.land',        policy: { read: true, write: false } },  // paid
  { url: 'wss://relay.orangepill.dev',    policy: { read: true, write: false } },  // paid
  { url: 'wss://relay.nostrati.com',      policy: { read: true, write: false } },  // paid
  { url: 'wss://relay.nostr.band',        policy: { read: true, write: false } },  // search
];

// https://github.com/staab/coracle/blob/20d61ed6dcb4dcfda3c43a84a81b94b4c4707344/src/agent/relays.ts#L26
// confirmed: 2023-03-28
const CORACLE_RELAY_LIST: Relay[] = [
  { url: 'wss://brb.io',                  policy: { read: true, write: true } },
  { url: 'wss://nostr.zebedee.cloud',     policy: { read: true, write: true } },
  { url: 'wss://nostr-pub.wellorder.net', policy: { read: true, write: true } },
  { url: 'wss://relay.nostr.band',        policy: { read: true, write: true } },  // search
  { url: 'wss://nostr.pleb.network',      policy: { read: true, write: true } },
  { url: 'wss://relay.nostrich.de',       policy: { read: true, write: true } },
  { url: 'wss://relay.damus.io',          policy: { read: true, write: true } },
];

// https://scrapbox.io/nostr/%E6%97%A5%E6%9C%AC%E3%83%AA%E3%83%AC%E3%83%BC
// confirmed: 2023-03-28
const JP_RELAY_LIST: Relay[] = [
  { url: 'wss://relay.nostr.wirednet.jp',    policy: { read: true, write: true  } },
  { url: 'wss://relay-jp.nostr.wirednet.jp', policy: { read: true, write: true  } },
  { url: 'wss://nostr.h3z.jp',               policy: { read: true, write: true  } },
  { url: 'wss://nostr-paid.h3z.jp',          policy: { read: true, write: false } },  // paid
  { url: 'wss://nostr.holybea.com',          policy: { read: true, write: true  } },
  { url: 'wss://nostr.fediverse.jp',         policy: { read: true, write: true  } },
];

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

const getRelayList = async () => {
  const nostr_keyx = (await chrome.storage.sync.get('nostr-keyx'))['nostr-keyx'] as string;
  if (!nostr_keyx) return [];
  const json = JSON.parse(nostr_keyx);
  return json?.state?.relayList as Relay[] ?? DEFAULT_RELAY_LIST;
};

export {
  Relay,
  NIP07Relay,
  NIP_07_APIS,
  DEFAULT_ACCOUNT,
  DEFAULT_URL_LIST,
  DEFAULT_RELAY_LIST,
  DAMUS_RELAY_LIST,
  SNORT_RELAY_LIST,
  IRIS_RELAY_LIST,
  AMETHYST_RELAY_LIST,
  CORACLE_RELAY_LIST,
  JP_RELAY_LIST,
  getAccount,
  getURLList,
  getRelayList
};
