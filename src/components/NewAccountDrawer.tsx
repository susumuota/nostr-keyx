// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { ChangeEvent, useCallback, useState } from 'react';
import { Box, Button, Container, Drawer, Paper, TextField } from '@mui/material';

import { useStore } from "./useStore";

function NewAccountDrawer() {
  const setAccount = useStore(state => state.setAccount);
  const accountList = useStore(state => state.accountList);
  const setAccountList = useStore(state => state.setAccountList);
  const isDrawer = useStore(state => state.isDrawer);
  const setDrawer = useStore(state => state.setDrawer);
  const showMessage = useStore(state => state.showMessage);
  const [newAccount, setNewAccount] = useState<string>('');

  const handleClose = useCallback(() => {
    setDrawer(false);
  }, []);

  const handleNewAccount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewAccount(event.target.value);
  }, []);

  const handleAddAccount = useCallback(() => {
    if (!newAccount) return showMessage('empty account');
    if (accountList.includes(newAccount)) return showMessage('already exists');
    setAccountList([...accountList, newAccount]);
    setAccount(newAccount);
    setNewAccount('');
    showMessage('added account: ' + newAccount);
  }, [newAccount, accountList]);

  return (
    <Drawer anchor="bottom" open={isDrawer} onClose={handleClose}>
      <Container fixed>
        <Paper elevation={6}>
          <Box p={2} mt={2} mb={2} minWidth={240}>
            <Box>
              Input new account:
            </Box>
            <Box mt={2}>
              <TextField label="New Account" value={newAccount} onChange={handleNewAccount} autoComplete="off" autoFocus />
            </Box>
            <Box mt={2}>
              <Button variant="outlined" onClick={handleAddAccount}>Add</Button>
              <Button sx={{ ml: 2 }} variant="outlined" onClick={handleClose}>Cancel</Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Drawer>
  );
}

export { NewAccountDrawer };
