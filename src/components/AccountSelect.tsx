// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useState } from 'react';
import { Box, FormControl, Icon, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';

import { useStore } from './useStore';
import { ConfirmDialog } from './ConfirmDialog';
import { NewItemDrawer } from './NewItemDrawer';

const isAlphanumeric = (str: string) => /^[a-zA-Z0-9_\.\-]+$/.test(str);

function AccountSelect() {
  const account = useStore(state => state.account);
  const accountList = useStore(state => state.accountList);
  const setAccount = useStore(state => state.setAccount);
  const addAccount = useStore(state => state.addAccount);
  const deleteAccount = useStore(state => state.deleteAccount);
  const showMessage = useStore(state => state.showMessage);
  const [isDrawer, setDrawer] = useState(false);
  const [isDialog, setDialog] = useState(false);

  const handleSelectChange = useCallback(async (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (!value) return showMessage('empty account');
    if (!accountList.includes(value)) return showMessage('no such account');
    setAccount(value);
    setDialog(false);
    showMessage('set account: ' + value);
  }, [accountList]);

  const handleDeleteAccount = useCallback(() => {
    if (!account) return showMessage('empty account');
    if (account === 'default') return showMessage('cannot delete default account');
    if (!accountList.includes(account)) return showMessage('no such account');
    deleteAccount(account);
    setDialog(false);
    showMessage('deleted account: ' + account);
  }, [account, accountList]);

  const handleNewAccount = useCallback((newAccount: string) => {
    if (!newAccount) {
      showMessage('empty account');
      return false;
    }
    if (accountList.includes(newAccount)) {
      showMessage('already exists');
      return false;
    }
    addAccount(newAccount);
    setDrawer(false);
    showMessage('added account: ' + newAccount);
    return true;
  }, [accountList]);

  const handleOpenDialog = useCallback(() => setDialog(true), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);
  const handleOpenDrawer = useCallback(() => setDrawer(true), []);
  const handleCloseDrawer = useCallback(() => setDrawer(false) , []);

  return (
    <Box>
      <Box>
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
      </Box>
      <Box sx={{ mt: 1, display: 'flex' }}>
        <Box component="span" sx={{ flexGrow: 1 }} />
        <Tooltip title="Add a new account">
          <IconButton onClick={handleOpenDrawer}>
            <Icon>add</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete this account">
          <IconButton onClick={handleOpenDialog}>
            <Icon>delete</Icon>
          </IconButton>
        </Tooltip>
      </Box>
      <NewItemDrawer
        title="Enter a new account name (alphanumeric, underscores, periods or hyphens are allowed)."
        label="New Account"
        open={isDrawer}
        onClick={handleNewAccount}
        onClose={handleCloseDrawer}
        validator={isAlphanumeric}
      />
      <ConfirmDialog
        open={isDialog}
        title="Delete account"
        contentText={`Are you sure you want to delete the account?: ${account}`}
        confirmText="Delete"
        cancelText="Cancel"
        onClick={handleDeleteAccount}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}

export { AccountSelect };
