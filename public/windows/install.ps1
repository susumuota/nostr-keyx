# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

param([Parameter(Mandatory)][ValidatePattern("^[a-z]+$")][string] $extension_id)

$json = ".\io.github.susumuota.nostr_keyx.json"
$path = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\io.github.susumuota.nostr_keyx"
$stab = $json + ".stab"

Get-Content $stab | ForEach-Object { $_ -creplace "__EXTENSION_ID__", $extension_id } | Out-File $json -Encoding ascii
New-Item -Path $path -Value (Convert-Path $json) -Force

"Done!"
Pause
