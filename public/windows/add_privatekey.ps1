# SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
# SPDX-License-Identifier: MIT

param([Parameter(Mandatory)][ValidatePattern("^[a-zA-Z0-9_\.\-]+$")][string] $service)

[void][Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]

$cred = Get-Credential -Message "Input account name (e.g. default) at User name field. And input private key (nsec1...) at password field."
$pcred = New-Object Windows.Security.Credentials.PasswordCredential -ArgumentList ($service, $cred.UserName, $cred.GetNetworkCredential().Password)
$vault = New-Object Windows.Security.Credentials.PasswordVault
$vault.Add($pcred)
