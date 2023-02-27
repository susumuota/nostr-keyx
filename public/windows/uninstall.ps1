# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

$path = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\io.github.susumuota.nostr_keyx"

Remove-Item -Path $path -Force

Write-Output "Done!"
Pause
