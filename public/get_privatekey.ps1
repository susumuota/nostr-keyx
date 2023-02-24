# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

param([Parameter(Mandatory)][ValidatePattern("^[a-zA-Z0-9_\.\-]+$")][string] $account,
      [Parameter(Mandatory)][ValidatePattern("^[a-zA-Z0-9_\.\-]+$")][string] $service)

[void][Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]

$vault = New-Object Windows.Security.Credentials.PasswordVault
$vault.Retrieve($service, $account).Password
