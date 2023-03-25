// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { parseArgs } from 'node:util';

import * as utils from '@noble/curves/abstract/utils';
import { bech32 } from '@scure/base';
import * as bip39 from '@scure/bip39';
import { wordlist as english_wordlist } from '@scure/bip39/wordlists/english';
import { wordlist as japanese_wordlist } from '@scure/bip39/wordlists/japanese';

// https://github.com/nostr-protocol/nips/blob/master/19.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip19.ts
// https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

const BECH32_MAX_SIZE = 5000;

const hexToBech32 = (prefix: string, hexstr: string) => (
  bech32.encode(prefix, bech32.toWords(utils.hexToBytes(hexstr)), BECH32_MAX_SIZE)
);

const bech32ToHex = (bech32str: string) => {
  const { prefix, words } = bech32.decode(bech32str, BECH32_MAX_SIZE);
  return { type: prefix, data: utils.bytesToHex(bech32.fromWords(words)) };
};

const showHelp = () => {
  console.log(`
Usage: npub2hex [-h] [-l language] [-n npub] [-x hex] [-m mnemonic]

Options:
  -h, --help      Show this help message and exit.
  -l, --language  Language of the wordlist for mnemonic (en or ja). default: en.
  -n, --npub      bech32 key (npub1... or nsec1...).
  -x, --hex       Hexadecimal string key.
  -m, --mnemonic  BIP-39 mnemonic of key (this is **NOT** NIP-06 compatible mnemonic).
`);
};

type Options = {
  help: boolean;
  language: string;
  npub: string;
  hex: string;
  bip39mnemonic: string;
  type: string;
};

const { values: { help, language, npub, hex, bip39mnemonic, type } } = parseArgs({
  options: {
    'help': { type: 'boolean', short: 'h', default: false },
    'language': { type: 'string', short: 'l', default: 'en' },
    'npub': { type: 'string', short: 'n', default: '' },
    'hex': { type: 'string', short: 'x', default: '' },
    'bip39mnemonic': { type: 'string', short: 'm', default: '' },
    'type': { type: 'string', short: 't', default: 'npub' },
  },
}) as { values: Options };

if (help || !language || (!npub && !hex && !bip39mnemonic)) {
  showHelp();
  process.exit(0);
}

const wordlist = (language === 'ja') ? japanese_wordlist : english_wordlist;

if (npub) {
  const { type, data } = bech32ToHex(npub);
  const entropy = utils.hexToBytes(data);
  const bip39mnemonic = bip39.entropyToMnemonic(entropy, wordlist);
  console.log({ type, npub, hex: data, bip39mnemonic });
} else if (hex) {
  const npub = hexToBech32(type, hex);
  const entropy = utils.hexToBytes(hex);
  const bip39mnemonic = bip39.entropyToMnemonic(entropy, wordlist);
  console.log({ type, npub, hex, bip39mnemonic });
} else if (bip39mnemonic) {
  const entropy = bip39.mnemonicToEntropy(bip39mnemonic, wordlist);
  const hex = utils.bytesToHex(entropy);
  const npub = hexToBech32(type, hex);
  console.log({ type, npub, hex, bip39mnemonic });
}
