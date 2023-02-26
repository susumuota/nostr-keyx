:: SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
:: SPDX-License-Identifier: MIT
::
:: https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location

REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\io.github.susumuota.nostr_keyx" /ve /t REG_SZ /d "%~dp0io.github.susumuota.nostr_keyx.json" /f
