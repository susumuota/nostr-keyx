// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppBar, Box, Button, Container, createTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, FormControl, InputLabel, Link, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, TextField, ThemeProvider, Toolbar, Typography } from '@mui/material';

import { useStorage } from './useStorage';

// TODO: refine
function App() {
  const [account, setAccount] = useStorage('account', 'default'); // will be stored in chrome.storage.sync
  const [accountList, setAccountList] = useStorage('accountList', ['default']); // will be stored in chrome.storage.sync
  const [targetAccount, setTargetAccount] = useState('');
  const [message, setMessage] = useState('');
  const [isSnackbar, setSnackbar] = useState(false);
  const [isDrawer, setDrawer] = useState(false);
  const [isDialog, setDialog] = useState(false);

  const handleSelectChange = useCallback(async (event: SelectChangeEvent<string>) => {
    if (accountList.includes(event.target.value)) {
      setAccount(event.target.value);
      setMessage('Changed account: ' + event.target.value);
    } else {
      setMessage('Account not found');
    }
    setSnackbar(true);
  }, [accountList]);

  const handleTargetAccount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTargetAccount(event.target.value);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (account === 'default') {
      setMessage('Cannot delete default account');
    } else if (accountList.includes(account)) {
      setAccountList(prev => prev.filter(a => a !== account));
      setAccount('default');
      setMessage('Deleted account: ' + account);
    } else {
      setMessage('Account not found');
    }
    setDialog(false);
    setSnackbar(true);
  }, [account, accountList]);

  const handleAddAccount = useCallback(async () => {
    if (accountList.includes(targetAccount)) {
      setMessage('Account already exists');
    } else if (!targetAccount) {
      setMessage('Empty account');
    } else {
      setAccountList(prev => [...prev, targetAccount]);
      setMessage('Added account: ' + targetAccount);
      setAccount(targetAccount);
      setTargetAccount('');
      setDrawer(false);
    }
    setSnackbar(true);
  }, [accountList, targetAccount]);

  const toggleDrawer = useCallback(() => {
    setTargetAccount('');
    setDrawer(prev => !prev);
  }, []);

  const closeSnackbar = useCallback(() => {
    setMessage('');
    setSnackbar(false);
  }, []);

  const openDialog = useCallback(() => {
    setDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(false);
  }, []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: 'rgba(25, 25, 112, 1.0)',
        contrastText: 'rgba(255, 255, 255, 1.0)',
      },
    },
  }), []);

  const typographySx = {
    m: 'auto',
    mt: 1.2,
    color: 'primary.contrastText',
    fontFamily: '"Bowlby One SC", "Roboto", sans-serif',
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" style={{ background: 'linear-gradient(to right bottom, rgba(25, 25, 112, 1.0), rgba(21, 183, 185, 1.0)' }}>
        <Toolbar>
          <Typography variant="h4" sx={typographySx}>Nostr-KeyX</Typography>
        </Toolbar>
      </AppBar>
      <Container fixed>
        <Paper elevation={6}>
          <Box p={2} mt={2} mb={2} minWidth={240} minHeight={280}>
            <Box>
              <FormControl fullWidth={true}>
                <InputLabel id="account-select-label">Account List</InputLabel>
                <Select
                  labelId="account-select-label"
                  id="account-select"
                  value={account}
                  label="Account List"
                  onChange={handleSelectChange}
                >
                  {accountList.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box mt={2}>
              <Button variant="outlined" onClick={toggleDrawer}>New</Button>
              <Button sx={{ ml: 2 }} variant="outlined" onClick={openDialog}>Delete</Button>
            </Box>
            <Box mt={3}>
              <Link mr={1} href="https://github.com/susumuota/nostr-keyx" target="_blank" rel="noreferrer noopener">
                <img src="icons/github32.png" alt="GitHub" />
              </Link>
            </Box>
          </Box>
        </Paper>
        <Drawer anchor="bottom" open={isDrawer} onClose={toggleDrawer}>
          <Container fixed>
            <Paper elevation={6}>
              <Box p={2} mt={2} mb={2} minWidth={240}>
                <Box>
                  Input new account:
                </Box>
                <Box mt={2}>
                  <TextField label="New Account" value={targetAccount} onChange={handleTargetAccount} autoComplete="off" />
                </Box>
                <Box mt={2}>
                  <Button variant="outlined" onClick={handleAddAccount}>Add</Button>
                  <Button sx={{ ml: 2 }} variant="outlined" onClick={toggleDrawer}>Cancel</Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Drawer>
        <Snackbar open={isSnackbar} autoHideDuration={2000} onClose={closeSnackbar} message={message} />
        <Dialog open={isDialog} onClose={closeDialog}>
          <DialogTitle>Delete account</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to Delete account: {account}</DialogContentText>
            <DialogActions>
              <Button variant="outlined" onClick={handleDeleteAccount} autoFocus>Delete</Button>
              <Button variant="outlined" onClick={closeDialog}>Cancel</Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
