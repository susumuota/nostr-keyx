#!/bin/bash

# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

# settings
node_path=$(which node)  # specify node path if you want to use another one

# constants (do not edit)
keychain="keychain.mjs"
json="io.github.susumuota.nostr_keyx.json"

# make paths absolute
script_dir=$(cd $(dirname $0); pwd)
json_path="${script_dir}/$(basename $json)"
json_stab_path="${json_path}.stab"
keychain_path="${script_dir}/$(basename $keychain)"

# ask extension ID if not specified
if [ -z "$1" ]; then
  read -p "Enter Chrome extension ID: " extension_id
else
  extension_id=$1
fi

# check extension ID
if [ -z "$extension_id" ]; then
  echo "Usage: $0 <extension_id>"
  exit 1
fi

echo "Extension ID: ${extension_id}"

# replace node path at shebang of keychain.mjs
# TODO: error handling
if [ ! -z "$node_path" ] && [ "$node_path" != "/usr/local/bin/node" ]; then
  sed -i -e "1 s|/usr/local/bin/node|${node_path}|" "$keychain_path"
fi

# replace __EXTENSION_ID__ and path of keychain.mjs in json file
# TODO: error handling
sed -e "s/__EXTENSION_ID__/${extension_id}/" \
  -e "s|/path/to/keychain.mjs|${keychain_path}|" \
  "$json_stab_path" > "$json_path"

# copy json file to native messaging host location
# https://developer.chrome.com/docs/apps/nativeMessaging/#native-messaging-host-location
cp -f "$json_path" ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/

echo "Installed successfully"
