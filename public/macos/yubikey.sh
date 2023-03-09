#!/bin/sh

# settings
# gpg command path. you must specify it with absolute path. try `which gpg` to find it.
gpg_path="/usr/local/bin/gpg"

# private key file name
privatekey="nostr_privatekey.asc"

script_dir=$(cd $(dirname $0); pwd)
privatekey_path="${script_dir}/$(basename $privatekey)"

# decrypt the private key with gpg and yubikey
# see details about options
# https://www.gnupg.org/documentation/manuals/gnupg/GPG-Configuration-Options.html
$gpg_path --batch --no-tty --status-fd 2 --with-colons -q --yes -d "$privatekey_path"
