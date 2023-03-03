// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { useStore } from "./useStore";

function DeleteDialog() {
  const account = useStore(state => state.account);
  const setAccount = useStore(state => state.setAccount);
  const accountList = useStore(state => state.accountList);
  const setAccountList = useStore(state => state.setAccountList);
  const isDialog = useStore(state => state.isDialog);
  const setDialog = useStore(state => state.setDialog);
  const showMessage = useStore(state => state.showMessage);

  const handleClose = useCallback(() => {
    setDialog(false);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    if (!account) return showMessage('empty account');
    if (account === 'default') return showMessage('cannot delete default account');
    if (!accountList.includes(account)) return showMessage('no such account');
    setAccountList(accountList.filter(a => a !== account));
    setAccount('default');
    showMessage('deleted account: ' + account);
  }, [account, accountList]);

  return (
    <Dialog open={isDialog} onClose={handleClose}>
      <DialogTitle>Delete account</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete the account?: {account}</DialogContentText>
        <DialogActions>
          <Button variant="outlined" onClick={handleDeleteAccount} autoFocus>Delete</Button>
          <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDialog };
