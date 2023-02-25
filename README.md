# nostr-keyx: Nostr Key Management Extension

[![GitHub release](https://img.shields.io/github/v/release/susumuota/nostr-keyx)](https://github.com/susumuota/nostr-keyx/releases)
[![GitHub License](https://img.shields.io/github/license/susumuota/nostr-keyx)](https://github.com/susumuota/nostr-keyx/blob/main/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/susumuota/nostr-keyx/build.yaml)](https://github.com/susumuota/nostr-keyx/actions/workflows/build.yaml)
[![GitHub last commit](https://img.shields.io/github/last-commit/susumuota/nostr-keyx)](https://github.com/susumuota/nostr-keyx/commits)
EN |
[JA](https://github-com.translate.goog/susumuota/nostr-keyx/blob/main/README.md?_x_tr_sl=en&_x_tr_tl=ja&_x_tr_hl=ja&_x_tr_pto=wapp) |
[ES](https://github-com.translate.goog/susumuota/nostr-keyx/blob/main/README.md?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=wapp) |
[ZH](https://github-com.translate.goog/susumuota/nostr-keyx/blob/main/README.md?_x_tr_sl=en&_x_tr_tl=zh-CN&_x_tr_hl=zh-CN&_x_tr_pto=wapp)

A [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) browser extension that uses the OS's native keychain application to protect your private keys.

- **OS's native keychain application** support ([macOS](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac), [Windows](https://support.microsoft.com/en-us/windows/accessing-credential-manager-1b5c916a-6a16-889f-8581-fc16e8165ac0), [Linux](https://www.passwordstore.org/))
- Minimal dependencies ([`@noble/secp256k1`](https://github.com/paulmillr/noble-secp256k1) and [`@scure/base`](https://github.com/paulmillr/scure-base))
- Multiple accounts (private keys) support

![keychain](https://user-images.githubusercontent.com/1632335/220174557-ac586a33-d305-4e72-9ca0-a9def568966f.png)

There are already great extensions like [nos2x](https://github.com/fiatjaf/nos2x) or [Alby](https://getalby.com/) for [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md). Unlike these existing extensions, `nostr-keyx` uses the **OS's native keychain application** (e.g. [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac) on MacOS) to store your private key instead of the web browser's local storage. In addition, all of the [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md) functions (`signEvent`, `encrypt`, `decrypt`, etc.) are executed outside of the web browser's memory. So it might be less risky than other extensions. I hope this extension helps you too.

## Install

### Install Node.js

- `nostr-keyx` uses [Node.js](https://nodejs.org/) to provide NIP-07 functions.
- Install [Node.js](https://nodejs.org/). e.g. `brew install node` for on macOS with Homebrew.
- Open Terminal and run `which node` and copy the absolute path of `node` command. e.g. `/usr/local/bin/node`. We will use it later.

### Option 1: Install from zip file

- Download the latest zip file from [Releases](https://github.com/susumuota/nostr-keyx/releases).
- Unzip it. `nostr-keyx-{version}.zip` will be extracted to `nostr-keyx-{version}` folder.

### Option 2: Build from source

> **Note**: For Windows, install [Git for Windows](https://gitforwindows.org/), start `git-bash` and run `npm config set script-shell /usr/bin/bash`. Otherwise, you will get error at `npm run build`.

```sh
# install latest stable version of Node.js
node -v  # I have tested on v18.14.1
git clone https://github.com/susumuota/nostr-keyx.git
cd nostr-keyx
npm ci
npm run build
```

### Install Chrome extension

- Open Chrome's extensions setting page `chrome://extensions`.
- Turn `Developer mode` on.
- Click `Load unpacked`.
- Specify the extension folder `/path/to/dist/extension`.
- You will see error messages but it's OK for now.
- Copy the `id` of the extension. e.g. `jhpjgkhjimkbjiigognoefgnclgngklh`. We will use it later.

### Setup Chrome's Native Messaging

- This extension uses [Chrome's Native Messaging](https://developer.chrome.com/docs/apps/nativeMessaging/) to communicate with native Node.js script.

#### For macOS and Linux

- You need to edit 2 lines in `dist/unix/io.github.susumuota.nostr_keyx.json`.
  - Change `path` to specify the absolute path of `keychain.mjs`.
  - Change `allowed_origins` to specify the `id` of the extension. You can find the `id` of the extension in Chrome's extensions setting page `chrome://extensions`.
  - See [this page](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host) for more details.

```json
{
  "name": "io.github.susumuota.nostr_keyx",
  "description": "A NIP-07 browser extension that uses the OS's native keychain application to protect your private keys.",
  "path": "/path/to/dist/unix/keychain.mjs",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://jhpjgkhjimkbjiigognoefgnclgngklh/"
  ]
}
```

- Copy `dist/unix/io.github.susumuota.nostr_keyx.json` to [NativeMessagingHosts directory](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location).

```sh
cp -p dist/unix/io.github.susumuota.nostr_keyx.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
```

- Edit shebang of `dist/unix/keychain.mjs` to specify the absolute path of `node` command. [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) means the first line of the script file. e.g. `#!/usr/local/bin/node`.

```sh
#!/usr/local/bin/node
...
```

- Open Terminal, run it with absolute path, input some text and enter, then it will show error but it's OK. If your shebang is wrong, it will show `no such file or directory` error.

```sh
/path/to/dist/unix/keychain.mjs
# 11111 # input some text and enter
# ({"result":null,"error":"unknown method"}...
```

#### For Windows

- You need to edit 2 lines in `dist/windows/io.github.susumuota.nostr_keyx.json`.
  - Change `path` to specify the absolute path of `keychain.bat`.
  - Change `allowed_origins` to specify the `id` of the extension. You can find the `id` of the extension in Chrome's extensions setting page `chrome://extensions`.
  - See [this page](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host) for more details.

```json
{
  "name": "io.github.susumuota.nostr_keyx",
  "description": "A NIP-07 browser extension that uses the OS's native keychain application to protect your private keys.",
  "path": "C:\\path\\to\\dist\\windows\\keychain.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://jhpjgkhjimkbjiigognoefgnclgngklh/"
  ]
}
```

- Edit `dist/windows/register_nostr_keyx.reg`.
  - Change `@="..."` to specify the absolute path of `dist/windows/io.github.susumuota.nostr_keyx.json`. See [this page](https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location) for more details.

```reg
Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\io.github.susumuota.nostr_keyx]
@="C:\\path\\to\\dist\\windows\\io.github.susumuota.nostr_keyx.json"
```

- Double click `register_nostr_keyx.reg` on Explorer. It will add registry key. You can check it on Registry Editor by searching `nostr_keyx`. If you want to uninstall this extension, delete the registry key too.

### Set your private key

> **Note**: If you need a private key for test, you can generate it with `npm run genkey`.

#### For macOS: Option 1: Using command `security`

- Here, I show you how to set your private key on Terminal. You can also use GUI [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac). I will show you later.
- Copy private key (e.g. `nsec1...`) to clipboard.
- Open Terminal.
- Run `security add-generic-password` command to create a new entry for your private key. Here, `-a` specifies the account name e.g `default`, `-s` specifies the service name (service **MUST** be `nostr-keyx`), and `-w` means the password will be asked.

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

#### For macOS: Option 2: Using GUI [Keychain Access](https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac)

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


#### For Windows: Using command `add_privatekey.ps1`

- You need to allow PowerShell to run local scripts. Open PowerShell as **Administrator** and run the following command to allow executing script. See details [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.3#remotesigned).

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

- Exit PowerShell as **Administrator**. Then, open PowerShell as a normal user.
- Run `Unblock-File` to unblock PowerShell script files that were downloaded from the internet so you can run them. See details [here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/unblock-file?view=powershell-7.3).

```powershell
cd C:\path\to\dist\windows
Unblock-File .\add_privatekey.ps1
Unblock-File .\get_privatekey.ps1
```

- Copy private key (e.g. `nsec1...`) to clipboard.
- Run `add_privatekey.ps1` script to create a new entry for your private key. Here, `nostr-keyx` is the service name. It **MUST** be `nostr-keyx`.

```powershell
.\add_privatekey.ps1 "nostr-keyx"
```

- Dialog will be shown. Type `default` to `Account Name` and paste your private key to `Password` and click `OK`.

![get_credential](https://user-images.githubusercontent.com/1632335/221339350-122fa0c2-e0a4-4843-bdd4-8fef58aec3a8.png)

- Type `credential manager` in the search box on the taskbar and select [Credential Manager](https://support.microsoft.com/en-us/windows/accessing-credential-manager-1b5c916a-6a16-889f-8581-fc16e8165ac0) Control panel.
- Click `Web Credentials` and you will see the entry for your private key.

![credential_manager](https://user-images.githubusercontent.com/1632335/221339296-9fa1eddb-bcff-47c1-859f-0ac717f2bf81.png)

#### For Linux: Using command `pass`

- Setup `pass`. See [this page](https://www.passwordstore.org/).
- Copy private key (e.g. `nsec1...`) to clipboard.
- Run `pass insert` command to create a new entry for your private key.

```sh
pass insert nostr-keyx/default
# paste your private key (e.g. nsec1....)
# paste it again
```

### Optional: Add web-based Nostr clients

- If you want to add other web-based Nostr clients, open `dist/manifest.json` and add their URLs to `content_scripts.matches` and `host_permissions`.

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

### Test it on Iris or Snort

- Open Chrome and go to `chrome://extensions/`.
- Clear errors of the extension.
- Reload the extension.
- Disable similar NIP-07 extensions, e.g. nos2x, Alby, etc. On Alby, you only need to disable `NIP-07` section on the settings.
- Click `Service Worker` to open dev console of the extension.
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
- [x] Add Windows keychain applications support.
- [x] GitHub Actions to build and publish the zip file.
- [ ] Support [NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md).
- [ ] Add YubiKey support.
- [ ] Better error handling.
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
