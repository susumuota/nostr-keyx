#!/bin/sh

# 0. setup openpgp with yubikey.
#    see https://support.yubico.com/hc/en-us/articles/360013790259-Using-Your-YubiKey-with-OpenPGP
#
# 1. set the touch policy for encryption to OFF (default is OFF)
#    see https://docs.yubico.com/software/yubikey/tools/ykman/OpenPGP_Commands.html#ykman-openpgp-keys-set-touch-options-key-policy
#
#    ykman openpgp info | grep Enc           # check the current setting, if it's already OFF, skip this step
#    ykman openpgp keys set-touch ENC OFF    # change the setting
#    ykman openpgp info | grep Enc           # confirm the setting, should be OFF
#
# 2. encrypt (and sign) the nostr private key with gpg and yubikey.
#
#   gpg -sea --default-recipient-self > nostr_privatekey.asc
#   # paste the private key, enter, and Ctrl+D
#
# 3. try to decrypt it with gpg and yubikey
#
#   gpg -d nostr_privatekey.asc
#
# 4. unplug yubikey and try again, it should fail
#
#   gpg -d nostr_privatekey.asc
#
# 5. plug yubikey again.
#
# 6. run this script.
#
#   /bin/sh ./yubikey.sh 2> /dev/null
#
#   it should decrypt the private key successfully.

# settings
# gpg command path. you must specify it with absolute path. try `which gpg` to find it.
gpg_path="/usr/local/bin/gpg"

# private key file name
privatekey="nostr_privatekey.asc"

script_dir=$(cd $(dirname $0); pwd)
privatekey_path="${script_dir}/$(basename $privatekey)"

# decript the private key with gpg and yubikey
# see details about options
# https://www.gnupg.org/documentation/manuals/gnupg/GPG-Configuration-Options.html
$gpg_path --batch --no-tty --status-fd 2 --with-colons -q --yes -d "$privatekey_path"
