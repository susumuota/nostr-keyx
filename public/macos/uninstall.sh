#!/bin/bash

# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

json="io.github.susumuota.nostr_keyx.json"

# remove json file from native messaging host location
# https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location
rm -f ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/${json}

echo "Unstalled successfully"
