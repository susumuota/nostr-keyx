// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

// import crypto from 'crypto'; // uncomment this line if you use node.js
import { base64 } from '@scure/base';

// https://www.clear-code.com/blog/2019/1/30.html
// https://www.clear-code.com/blog/2019/2/8.html

// salt is needed to regenerate the key from the password
type AESKey = {
  key: CryptoKey;
  salt: ArrayBuffer;
};

// also, attach salt here for convenience.
type AESData = {
  data: ArrayBuffer,
  iv: ArrayBuffer;
  salt: ArrayBuffer;
};

const generateSalt = () => crypto.getRandomValues(new Uint8Array(16));

const generateKey = async (password: ArrayBuffer, salt: ArrayBuffer) => {
  // hashing the password
  const baseKey = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest({ name: 'SHA-256' }, password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  // stretching 100000 times
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  return { key, salt } as AESKey;
};

const exportKey = async ({ key, salt } : AESKey) => {
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return JSON.stringify([exportedKey, salt].map(x => base64.encode(new Uint8Array(x))));
};

const importKey = async (text: string) => {
  const [exportedKey, salt] = JSON.parse(text).map(base64.decode) as [Uint8Array, Uint8Array];
  const key = await crypto.subtle.importKey(
    'raw',
    exportedKey,
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  return { key, salt } as AESKey;
};

const encrypt = async (data: ArrayBuffer, { key, salt }: AESKey) => {
  // TODO: how to construct IV? see section 8.2.1 of this pdf:
  // https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const enc = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, data,
  );
  return { data: enc, iv, salt } as AESData;
};

const decrypt = async ({ data, iv }: AESData, { key }: AESKey) => {
  const dec = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, data
  );
  return dec;
};

const exportData = async ({ data, iv, salt }: AESData) => {
  return JSON.stringify([data, iv, salt].map(x => base64.encode(new Uint8Array(x))));
}

const importData = async (text: string) => {
  const [data, iv, salt] = JSON.parse(text).map(base64.decode) as [Uint8Array, Uint8Array, Uint8Array];
  return { data, iv, salt } as AESData;
}

export { generateSalt, generateKey, exportKey, importKey, encrypt, decrypt, exportData, importData };
