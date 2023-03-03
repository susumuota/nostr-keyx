// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback } from 'react';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { useStore } from "./useStore";

function AccountSelect() {
  const account = useStore(state => state.account);
  const setAccount = useStore(state => state.setAccount);
  const accountList = useStore(state => state.accountList);
  const showMessage = useStore(state => state.showMessage);

  const handleSelectChange = useCallback(async (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (!value) return showMessage('empty account');
    if (!accountList.includes(value)) return showMessage('no such account');
    setAccount(value);
    showMessage('set account: ' + value);
  }, [accountList]);

  return (
    <FormControl fullWidth>
      <InputLabel id="account-select-label">Account</InputLabel>
      <Select
        labelId="account-select-label"
        id="account-select"
        value={account}
        label="Account"
        onChange={handleSelectChange}
      >
        {accountList.map((a, i) => <MenuItem key={i} value={a}>{a}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

export { AccountSelect };
