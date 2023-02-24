// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// Usage: npx ts-node-esm bin/npub2hex.ts BECH32TEXT

import * as secp from '@noble/secp256k1';
import { bech32 } from '@scure/base';

// https://github.com/nostr-protocol/nips/blob/master/19.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip19.ts

const BECH32_MAX_SIZE = 5000;

// const hexToBech32 = (prefix: string, hexstr: string) => (
//   bech32.encode(prefix, bech32.toWords(secp.utils.hexToBytes(hexstr)), BECH32_MAX_SIZE)
// );

const bech32ToHex = (bech32str: string) => {
  const { prefix, words } = bech32.decode(bech32str, BECH32_MAX_SIZE);
  return { type: prefix, data: secp.utils.bytesToHex(bech32.fromWords(words)) };
};

if (process.argv[2]) {
  console.log(bech32ToHex(process.argv[2] as string));
} else {
  console.log('Usage: npx ts-node-esm bin/npub2hex.ts BECH32TEXT');
}
