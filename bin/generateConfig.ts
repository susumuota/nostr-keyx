// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import * as secp from '@noble/secp256k1';

const generateKeys = () => {
  const privateKey = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
  const publicKey = secp.utils.bytesToHex(secp.schnorr.getPublicKey(privateKey));
  return { privateKey, publicKey };
};

const generateRelays = () => {
  const relays = {
    // 'wss://relay.damus.io': { read: true, write: true },
    // 'wss://relay.snort.social': { read: true, write: true },
    // ...
  }
  return { relays };
};

const config = {...generateKeys(), ...generateRelays()};

console.log(`
// paste this into extensions dev console
await chrome.storage.local.set(${JSON.stringify(config, null, 2)});
await chrome.storage.local.get();
`);
