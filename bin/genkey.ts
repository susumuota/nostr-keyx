// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { parseArgs } from 'node:util';

import { secp256k1, schnorr } from '@noble/curves/secp256k1';
import * as utils from '@noble/curves/abstract/utils';
import { bech32 } from '@scure/base';
import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist as english_wordlist } from '@scure/bip39/wordlists/english';
import { wordlist as japanese_wordlist } from '@scure/bip39/wordlists/japanese';

// https://github.com/nostr-protocol/nips/blob/master/19.md
// https://github.com/nbd-wtf/nostr-tools/blob/master/nip19.ts

const BECH32_MAX_SIZE = 5000;

// https://github.com/nostr-protocol/nips/blob/master/06.md
const DERIVATION_PATH = "m/44'/1237'/0'/0/0";

const hexToBech32 = (prefix: string, hexstr: string) => (
  bech32.encode(prefix, bech32.toWords(utils.hexToBytes(hexstr)), BECH32_MAX_SIZE)
);

const bech32ToHex = (bech32str: string) => {
  const { prefix, words } = bech32.decode(bech32str, BECH32_MAX_SIZE);
  return { type: prefix, data: utils.bytesToHex(bech32.fromWords(words)) };
};

const mnemonicToPrivateKey = (mnemonic: string, wordlist: string[]) => {
  if (!bip39.validateMnemonic(mnemonic, wordlist)) throw new Error('Invalid mnemonic');
  const entropy = bip39.mnemonicToEntropy(mnemonic, wordlist);
  if (bip39.entropyToMnemonic(entropy, wordlist) !== mnemonic) throw new Error('Invalid mnemonic');
  const masterKey = HDKey.fromMasterSeed(entropy);
  const newKey = masterKey.derive(DERIVATION_PATH);
  if (!newKey.privateKey) throw new Error('Invalid key derivation');
  const privateKey = utils.bytesToHex(newKey.privateKey);
  return privateKey;
}

const generateKeys = (privateKey: string) => {
  // const privateKey = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
  const publicKey = utils.bytesToHex(schnorr.getPublicKey(privateKey));
  const nsec = hexToBech32('nsec', privateKey);
  const npub = hexToBech32('npub', publicKey);
  console.assert(bech32ToHex(nsec).data === privateKey);
  console.assert(bech32ToHex(npub).data === publicKey);
  return { privateKey, publicKey, nsec, npub };
};

const showHelp = () => {
  console.log(`
Usage: genkey [-h] [-l language] [-p pattern] [-m mnemonic]

Options:
  -h, --help      Show this help message and exit.
  -l, --language  Language of the wordlist for mnemonic (en or ja). default: en.
  -p, --pattern   Generate keys with regular expression to match the npub.
  -m, --mnemonic  Recover keys from mnemonic phrase.
`);
};

type Options = {
  help: boolean;
  language: string;
  pattern: string;
  mnemonic: string;
};

const { values: { help, language, pattern, mnemonic } } = parseArgs({
  options: {
    'help': { type: 'boolean', short: 'h', default: false },
    'language': { type: 'string', short: 'l', default: 'en' },
    'pattern': { type: 'string', short: 'p', default: '' },
    'mnemonic': { type: 'string', short: 'm', default: '' },
  },
}) as { values: Options };

if (help || (!language)) {
  showHelp();
  process.exit(0);
}

const wordlist = (language === 'ja') ? japanese_wordlist : english_wordlist;

if (mnemonic) {
  const privateKey = mnemonicToPrivateKey(mnemonic, wordlist);
  const keys = generateKeys(privateKey);
  console.log({ nip06mnemonic: mnemonic, ...keys });
  process.exit(0);
}

while (true) {
  const mnemonic = bip39.generateMnemonic(wordlist, 256);
  const privateKey = mnemonicToPrivateKey(mnemonic, wordlist);
  const keys = generateKeys(privateKey);
  if (keys.npub.match(pattern)) {
    console.log({ nip06mnemonic: mnemonic, ...keys });
    break;
  }
}
