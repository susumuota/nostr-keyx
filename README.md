# nostr-keyx: Nostr key management extension

A minimal Chrome extension for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md).

This extension can protect your private key from being passed to web-based Nostr clients such as [Iris](https://iris.to/) or [Snort](https://snort.social/).

- **OS native keychain application** support ([macOS](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac))
- Minimal dependencies ([`@noble/secp256k1`](https://github.com/paulmillr/noble-secp256k1) and [`@scure/base`](https://github.com/paulmillr/scure-base))
- Multiple accounts (private keys) support

![keychain](https://user-images.githubusercontent.com/1632335/220174557-ac586a33-d305-4e72-9ca0-a9def568966f.png)

There are already great extensions like [nos2x](https://github.com/fiatjaf/nos2x) or [Alby](https://getalby.com/) for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md). Unlike these existing extensions, `nostr-keyx` uses **OS native keychain application** (e.g. [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac) on macOS) to protect your private key. This extension does not store your private key in the local storage of the web browser. Instead, it stores it in the OS native keychain applications. Also, all [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) functions (`signEvent`, `encrypt`, `decrypt`, etc.) are executed outside the web browser memory space. So it might be less risky than other methods. I hope this extension helps you too.

## Install

### Note for Windows (work in progress)

> **Note**: Currently, the latest version only supports macOS and Linux. Please use previous version [`v1.0.1`](https://github.com/susumuota/nostr-keyx/tree/v1.0.1) with AES encryption for the private key protection instead.

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
node -v  # I have tested on v18.14.1
git clone https://github.com/susumuota/nostr-keyx.git
cd nostr-keyx
npm ci
npm run build
```

- Open Chrome's extensions setting page `chrome://extensions`.
- Turn `Developer mode` on.
- Click `Load unpacked`.
- Specify the dist folder `/path/to/nostr-keyx/dist`.

### Install Node.js

- This version of `nostr-keyx` uses [Node.js](https://nodejs.org/) to communicate with OS native keychain applications.
- Install [Node.js](https://nodejs.org/). e.g. `brew install node` for Homebrew.
- Run `which node` and copy the path of `node` command. e.g. `/usr/local/bin/node`. Later, you need to change the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) of `dist/keychain.mjs` to specify the absolute path of `node` command.

## Settings

### Setup Chrome's Native Messaging

- This extension uses [Chrome's Native Messaging](https://developer.chrome.com/docs/apps/nativeMessaging/) to communicate with OS native keychain applications.
- Here, you need to change 2 lines in `dist/io.github.susumuota.nostr_keyx.json`.
  - Change `path` to specify the absolute path of `keychain.mjs`.
  - Change `allowed_origins` to specify the `id` of the extension. You can find the `id` of the extension in Chrome's extensions setting page `chrome://extensions`.

```json
{
  "name": "io.github.susumuota.nostr_keyx",
  "description": "A minimal Chrome extension for NIP-07. This extension can prevent your private key from being passed to web-based Nostr clients.",
  "path": "/Users/username/Documents/chromeext/nostr-keyx/dist/keychain.mjs",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://jhpjgkhjimkbjiigognoefgnclgngklh/"
  ]
}
```

- Copy `dist/io.github.susumuota.nostr_keyx.json` to [NativeMessagingHosts directory](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location).

```sh
cp -p dist/io.github.susumuota.nostr_keyx.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
```

- Edit shebang of `dist/keychain.mjs` to specify the absolute path of `node` command. Or edit `src/keychain.ts` and run `npm run build`. [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) means the first line of the script file. e.g. `#!/usr/local/bin/node`.

```sh
#!/usr/local/bin/node
...
```

- Test it. Run it with absolute path on Terminal, input some text and enter, then it will show `uncaughtException` error but it's OK. If your shebang is wrong, it will show `no such file or directory` error.

```sh
/Users/username/Documents/chromeext/nostr-keyx/dist/keychain.mjs

11111 # input some text and enter
z{"id":"","type":"error","result":"uncaughtException. ...
```

### Set your private key

#### macOS: Option 1: Using command `security`

- Here, I show you how to set your private key on Terminal. You can also use GUI [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac). I will show you later.
- Copy private key (e.g. `nsec1...`) to clipboard.
- Open Terminal.
- Run `security` command to create a new entry for your private key. Here, `-a` is the account name e.g `default`, `-s` is the service name, and `-w` means the password will be asked. `add-generic-password` sub command is used to create a new entry.

```sh
security add-generic-password -a default -s nostr-keyx -w
# paste your private key (e.g. nsec1....)
# paste it again
```

- Confirm that the entry is created. `find-generic-password` sub command will show the password.

```sh
security find-generic-password -a default -s nostr-keyx -w
```

- If you want to delete the entry, run `delete-generic-password` sub command.

```sh
security delete-generic-password -a default -s nostr-keyx
```

- You can create multiple accounts for multiple private keys. e.g. `default`, `bot`, `test`, etc. But service name must be `nostr-keyx`.

> **Note**: Right now, `security` command can access the private key without password. But you can revoke that by Keychain Access application. See the next section.

#### macOS: Option 2: Using GUI [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac)

- Open spotlight search and type `Keychain Access` and open it.
- `File` menu > `New Password Item...`
- Type `nostr-keyx` to `Keychain Item Name` (the first text field).
- Type `default` to `Account Name` (the second text field).
- Copy private key (e.g. `nsec1...`) to clipboard.
- Paste it to `Password` (the third text field).
- Click `Add`.

![new_password_item](https://user-images.githubusercontent.com/1632335/220175161-a5c0daa7-62bc-45bb-a270-ffa8a78cd80f.png)

- You can create multiple accounts for multiple private keys. But make sure that the service name is `nostr-keyx`.
- Open Terminal and run `security` command to confirm that the private key can be accessed via `security` command.

```sh
security find-generic-password -a default -s nostr-keyx -w
```

> **Note**: When you try to access private key, you will be asked to enter your password. You can click `Always Allow` to allow the access without password. When you want to revoke that, you can change the access control of the entry. Right click the entry and select `Get Info`. Then, click `Access Control` tab and click `security` on `Always allow access by these applications:` area then click `-` button to remove it. Now you will be asked to enter your password when you try to access the private key via `security` command.

![revoke_application](https://user-images.githubusercontent.com/1632335/220175649-39b206cc-a845-4c48-83ec-367668aacabe.png)

#### Linux: Using command `pass`

- Install `pass` command. e.g. `sudo apt install pass`.
- Setup `pass` https://www.passwordstore.org/
- Copy private key (e.g. `nsec1...`) to clipboard.
- Run `pass` command to create a new entry for your private key. Here, `insert` sub command is used to create a new entry.

```sh
pass insert nostr-keyx/default
# paste your private key (e.g. nsec1....)
# paste it again
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

- First, disable similar NIP-07 extensions, e.g. nos2x, Alby, etc. On Alby, you only need to disable `NIP-07` section on the settings.
- Go to extension page and click `Service Worker` to open dev console of the extension.
- If you have used previous versions of this extension, you should clear the extension's cache. Type the following commands in the extension's dev console.

```javascript
await chrome.storage.local.clear();
await chrome.storage.session.clear();
```

- Enable log level `Verbose` to show debug logs.
- Go to [Iris](https://iris.to/) or [Snort](https://snort.social/).
- Logout if you already logged in.
- Click `Nostr extension login` for Iris or `Login with Extension (NIP-07)` for Snort. It should use `window.nostr.getPublicKey` to get public key.
- Post some notes. It should use `window.nostr.signEvent` to sign events with private key.
- Send/receive direct messages. It should use `window.nostr.nip04.encrypt/decrypt` to encrypt/decrypt messages.
- You can change private key by popup UI of the extension.

![popup](https://user-images.githubusercontent.com/1632335/219871820-efb079ad-1bb0-4157-b327-a963e57ef453.png)

- Press `NEW` button and enter your account name e.g. `bot`, then `ADD` again.
- You can switch accounts by selecting list items on the popup UI.

## Potential risks

- This extension passes your private key to [secp256k1.schnorr.sign](https://github.com/paulmillr/noble-secp256k1#schnorrsignmessage-privatekey) and [secp256k1.getSharedSecret](https://github.com/paulmillr/noble-secp256k1#getsharedsecretprivatekeya-publickeyb). The security of this extension depends heavily on these functions.
- Let me know if you find any other potential risks.

## TODO

- [x] Prepare a zip file for easy installation.
- [x] Find a way to store the private key securely.
- [x] Find a way to store the AES key securely.
- [x] Find a way to access OS's Keychain app or Chrome's password manager from the Chrome extension.
- [x] Minimal UI.
- [x] Add profiles to switch multiple accounts.
- [ ] Support [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md).
- [ ] Add Windows keychain applications support.
- [ ] Add YubiKey support.
- [ ] Better error handling.
- [ ] GitHub Actions to build and publish the zip file.
- [ ] Test `relays`.
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
