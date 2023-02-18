// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import * as secp from '@noble/secp256k1';
import { bech32 } from '@scure/base';

// https://github.com/nostr-protocol/nips/blob/master/19.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip19.ts

const BECH32_MAX_SIZE = 5000;

const hexToBech32 = (prefix: string, hexstr: string) => (
  bech32.encode(prefix, bech32.toWords(secp.utils.hexToBytes(hexstr)), BECH32_MAX_SIZE)
);

const bech32ToHex = (bech32str: string) => {
  const { prefix, words } = bech32.decode(bech32str, BECH32_MAX_SIZE);
  return { type: prefix, data: secp.utils.bytesToHex(bech32.fromWords(words)) };
};

const generateKeys = () => {
  const privateKey = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
  const publicKey = secp.utils.bytesToHex(secp.schnorr.getPublicKey(privateKey));
  const nsec = hexToBech32('nsec', privateKey);
  const npub = hexToBech32('npub', publicKey);
  console.assert(bech32ToHex(nsec).data === privateKey);
  console.assert(bech32ToHex(npub).data === publicKey);
  return { privateKey, publicKey, nsec, npub };
};

console.log(generateKeys());
