# nostr-keyx: Nostr key management extension

A minimal Chrome extension for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md).

This extension can prevent your private key from being passed to web-based Nostr clients such as [Iris](https://iris.to/) or [Snort](https://snort.social/).

- Only ~200 lines (without UI)
- Easy to read (I hope)
- Minimal dependencies ([`@noble/secp256k1`](https://github.com/paulmillr/noble-secp256k1) and [`@scure/base`](https://github.com/paulmillr/scure-base))

There is already a great extension [nos2x](https://github.com/fiatjaf/nos2x) for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md). But I made a minimal extension to fully understand how it works and to find out the potential risks. I hope this extension will help you as well.

## Install

### Option 1: Install from zip file

- Download the latest zip file from [Releases](https://github.com/susumuota/nostr-keyx/releases).
- Unzip it. `nostr-keyx-{version}.zip` will be extracted to `nostr-keyx-{version}` folder.
- Open Chrome's extensions setting page `chrome://extensions`.
- Turn `Developer mode` on.
- Click `Load unpacked`.
- Specify the dist folder `/path/to/nostr-keyx-{version}`.

### Option 2: Build from source

```sh
# install latest stable version of Node.js
node -v  # I have tested on v18.14.0
git clone https://github.com/susumuota/nostr-keyx.git
cd nostr-keyx
npm ci
npm run build
```

- Open Chrome's extensions setting page `chrome://extensions`.
- Turn `Developer mode` on.
- Click `Load unpacked`.
- Specify the dist folder `/path/to/nostr-keyx/dist`.

## Settings

### Set your private key and password.

- Pin this extension icon to the Chrome's toolbar.
- Open extension's popup menu.

![popup](https://user-images.githubusercontent.com/1632335/218505769-b9611599-3f34-4264-9a1d-edc95991efde.png)

- Input your private key (`nsec...`) and password. This password is used to encrypt your private key.
- Click `Save`.

> **Note**: It generates an AES key (common key) from your password and then encrypts your private key with it. Your private key is stored in encrypted form in `chrome.store.local` (on the file system). And the AES key is stored in `chrome.store.session` (in memory). When you quit Chrome, `chrome.store.session` is deleted. So you will have to enter the password again the next time you start Chrome. If you want to store your AES key in `chrome.store.local`, you can change `chrome.store.session` to `chrome.store.local` in `src/background.ts` and `src/popup.tsx`. However, this will make your private key less secure. I may add an option in the future to choose whether to store the AES key in `chrome.store.local` or `chrome.store.session` to avoid entering the password every time. See [this document](https://developer.chrome.com/docs/extensions/reference/storage/#storage-areas) for more details about Chrome's local storage.

- If you input the wrong private key or password, click `Clear` to clear the settings (it will call `chrome.storage.local.clear()` and `chrome.storage.session.clear()`). Then input the correct one again.
- Confirm settings. Open dev console of the extension and run the following commands.

```javascript
await chrome.storage.local.get();
```

- It should show something like this. If your public key is correct, it succeeded to add private key because public key is derived from private key.

```javascript
{
  encryptedPrivateKey: '["base64 string","base64 string","base64 string"]',
  publicKey: 'hex encoded public key'
}
```

```javascript
await chrome.storage.session.get();
```

```javascript
{
  commonKey: '["base64 string","base64 string"]'}
}
```

- Once you have set your private key and password, you can use this extension to sign events and encrypt/decrypt messages.

> **Note**: DO NOT forget to input password again if you restart Chrome or reload the extension. Once you have set your private key and password, don't have to input private key again. Just input password and click `Save`.

### Optional: Add web-based Nostr clients

- If you want to add other web-based Nostr clients, open `public/manifest.json` and add their URLs to `content_scripts.matches` and `host_permissions`.

```json
  "content_scripts": [
    {
      "matches": [
        "https://iris.to/*",
        "https://snort.social/*",
        "http://localhost/*"
      ],
      ...
    }
  ],
  ...
  "host_permissions": [
    "https://iris.to/*",
    "https://snort.social/*",
    "http://localhost/*"
  ]
```

- Rebuild the extension.

```sh
npm run build
```

- Reload the extension. (Or restart Chrome)

### Test it on Iris or Snort

- First, disable similar NIP-07 extensions, e.g. nos2x, Alby, etc.
- Go to extension page and click `Service Worker` to open dev console of the extension.
- Enable log level `Verbose` to show debug logs.
- Go to [Iris](https://iris.to/) or [Snort](https://snort.social/).
- Logout if you already logged in.
- Click `Nostr extension login` for Iris or `Login with Extension (NIP-07)` for Snort. It should use `window.nostr.getPublicKey` to get public key.
- Post some notes. It should use `window.nostr.signEvent` to sign events with private key.
- Send/receive direct messages. It should use `window.nostr.nip04.encrypt/decrypt` to encrypt/decrypt messages.

I have tested this extension on Iris and Snort.

## Potential risks

- Your private key is stored in Chrome's extension-specific [local storage](https://developer.chrome.com/docs/extensions/reference/storage/#storage-areas) `chrome.storage.local` (on the file system) in encrypted form using an AES key (common key). And the AES key is stored in `chrome.storage.session` (in memory). If someone can see your `chrome.storage.session`, they can decrypt your private key using the AES key.
- This extension passes your private key to [secp256k1.schnorr.sign](https://github.com/paulmillr/noble-secp256k1#schnorrsignmessage-privatekey) and [secp256k1.getSharedSecret](https://github.com/paulmillr/noble-secp256k1#getsharedsecretprivatekeya-publickeyb). If these functions are not secure, your private key may be exposed.
- Let me know if you find any other potential risks.

## TODO

- [x] Prepare a zip file for easy installation.
- [x] Find a way to store the private key securely.
- [ ] Find a way to store the AES key securely.
- [ ] Error handling.
- [ ] Minimal UI.
- [ ] GitHub Actions to build and publish the zip file.
- [ ] Test `relays`.
- [ ] Find a way to access OS's Keychain app or Chrome's password manager from the Chrome extension, if it's possible.
- [ ] Add profiles to switch multiple accounts.
- [ ] Chrome Web Store?

## Source code

- https://github.com/susumuota/nostr-keyx

## Related Links

- [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md): `window.nostr` capability for web browsers.
- [nos2x](https://github.com/fiatjaf/nos2x): Chrome Extension for NIP-07.
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools): Tools for developing Nostr clients.
- [noble-secp256k1](https://github.com/paulmillr/noble-secp256k1): JavaScript implementation of [secp256k1](https://www.secg.org/sec2-v2.pdf).
- [scure-base](https://github.com/paulmillr/scure-base): Secure implementation of base64, etc.
- [Iris](https://iris.to/): A web-based Nostr client.
- [Snort](https://snort.social/): A web-based Nostr client.

## License

MIT License, see [LICENSE](LICENSE) file.

## Author

Susumu OTA

- nostr: `npub1susumuq8u7v0sp2f5jl3wjuh8hpc3cqe2tc2j5h4gu7ze7z20asq2w0yu8`
- Twitter: [@susumuota](https://twitter.com/susumuota)
- GitHub: [susumuota](https://github.com/susumuota)
