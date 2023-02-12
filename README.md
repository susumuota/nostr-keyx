# nostr-keyx: Nostr key management extension

A minimal Chrome extension for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md).

This extension can prevent your private key from being passed to web-based Nostr clients such as [Iris](https://iris.to/) or [Snort](https://snort.social/).

- Only ~200 lines
- Easy to read (I hope)
- Minimal dependencies ([`@noble/secp256k1`](https://github.com/paulmillr/noble-secp256k1) and [`@scure/base`](https://github.com/paulmillr/scure-base))

There is already a great extension [nos2x](https://github.com/fiatjaf/nos2x) for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md). But I made a minimal extension to fully understand how it works and to find out the potential risks. I hope this extension will help you as well.

## Install

### Option 1: Install zip file

- Download the latest zip file from [Releases](https://github.com/susumuota/nostr-keyx/releases).
- Unzip it. `nostr-keyx-{version}.zip` will be extracted to `nostr-keyx-{version}` folder.
- Open Chrome's extensions setting page `chrome://extensions`.
- Turn `Developer mode` on.
- Click `Load unpacked`.
- Specify the dist folder `/path/to/nostr-keyx-version`.

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

### Optional: Generate sample config for testing

- I have prepared `bin/generateConfig.ts' to generate a template configuration for testing.
- To generate a template config, run the following command.

```sh
npx ts-node-esm bin/generateConfig.ts
```

### Optional: Convert Bech32 keys (`nsec...` or `npub...`) to hex format

- If you have keys in Bech32 format (`nsec...` or `npub...`), you can convert them to hex format with `bin/npub2hex.ts`.

```sh
npx ts-node-esm bin/npub2hex.ts "nsec..."
npx ts-node-esm bin/npub2hex.ts "npub..."
```

> **Note**: I recommend using environment variables to store keys to avoid leaking them to the shell history.

- Add keys to `~/.bashrc` and restart your terminal.

```sh
export NOSTR_NSEC="nsec..."
export NOSTR_NPUB="npub..."
```

- Convert to hex format using environment variables.

```sh
npx ts-node-esm bin/npub2hex.ts $NOSTR_NSEC
npx ts-node-esm bin/npub2hex.ts $NOSTR_NPUB
```

- `data` field is the hex encoded key.

```javascript
{
  type: 'npub',
  data: '...'
}
```

### Set your private and public keys

- Open Chrome's extensions setting page `chrome://extensions`.
- Click `Service Worker` of this extension to open the dev console.
- Run the following commands.

```javascript
await chrome.storage.local.set({
  privateKey: "hex encoded private key",
  publicKey: "hex encoded public key",
  relays: {}
});
```

You must specify both `privateKey` and `publicKey`.

> **Note**: Keys must be hex encoded, **NOT** `nsec...` or `npub...`.

> **Note**: `relays` has not been well tested yet, so just put `{}`.

- Confirm settings.

```javascript
await chrome.storage.local.get();
```

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
- Logout.

I have tested this extension on Iris and Snort.

## Potential risks

- Your private key is stored in plain text in Chrome's extension-specific [local storage](https://developer.chrome.com/docs/extensions/reference/storage/). This makes it less secure.
- This extension passes your private key to [secp256k1.schnorr.sign](https://github.com/paulmillr/noble-secp256k1#schnorrsignmessage-privatekey) to sign and [secp256k1.getSharedSecret](https://github.com/paulmillr/noble-secp256k1#getsharedsecretprivatekeya-publickeyb) to encrypt messages. If these functions are not secure, your private key may be exposed.
- Settings are command-line based. It may cause accidental exposure of your private key.
- Let me know if you find any other potential risks.

## TODO

- [x] Prepare a zip file for easy installation.
- [ ] Find a way to store the private key securely. Is it possible to use the macOS Keychain (or similar one) from the Chrome extension?
- [ ] GitHub Actions to build and publish the zip file.
- [ ] Test `relays`.
- [ ] Add profiles to switch multiple accounts.
- [ ] Minimal UI.
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
