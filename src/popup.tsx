// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppBar, Box, Button, Container, createTheme, CssBaseline, Link, Paper, Snackbar, TextField, ThemeProvider, Toolbar, Typography } from '@mui/material';
import * as secp from '@noble/secp256k1';
import { bech32 } from '@scure/base';

import { decrypt, encrypt, exportData, exportKey, generateKey, generateSalt, importData } from './AES';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const BECH32_MAX_SIZE = 5000;

const bech32ToHex = (bech32str: string) => {
  const { prefix, words } = bech32.decode(bech32str, BECH32_MAX_SIZE);
  return { type: prefix, data: secp.utils.bytesToHex(bech32.fromWords(words)) };
};

const getEncryptedPrivateKey = async () => (
  (await chrome.storage.local.get('encryptedPrivateKey'))['encryptedPrivateKey'] as string
);

const getPublicKey = async () => (
  (await chrome.storage.local.get('publicKey'))['publicKey'] as string
);

function SaveButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  // TODO: refine
  const handleClick = useCallback(async () => {
    const privateKey = document.querySelector<HTMLInputElement>('#privatekey')?.value.trim();
    const password = document.querySelector<HTMLInputElement>('#password')?.value.trim();
    if (privateKey && password) { // update private key and password
      const hexPrivateKey = privateKey.startsWith('nsec') ? bech32ToHex(privateKey).data : privateKey;
      const salt = generateSalt();
      const aesKey = await generateKey(encoder.encode(password), salt);
      const data = await encrypt(encoder.encode(hexPrivateKey), aesKey);
      // console.assert(hexPrivateKey === decoder.decode(await decrypt(data, aesKey)));
      const commonKey = await exportKey(aesKey);
      const encryptedPrivateKey = await exportData(data);
      try {
        const publicKey = secp.utils.bytesToHex(secp.schnorr.getPublicKey(hexPrivateKey));
        chrome.storage.session.set({ commonKey });
        chrome.storage.local.set({ encryptedPrivateKey });
        chrome.storage.local.set({ publicKey });
        setMessage('Private key and password are saved.');
        setOpen(true);
      } catch (e) {
        setMessage('Invalid private key. Nothing is changed.');
        setOpen(true);
      }
    } else if (privateKey && !password) {
      setMessage('Password is required.');
      setOpen(true);
    } else if (!privateKey && password) { // update only password
      const encryptedPrivateKey = await getEncryptedPrivateKey();
      const publicKey = await getPublicKey();
      if (encryptedPrivateKey && publicKey) {
        const aesData = await importData(encryptedPrivateKey);
        const salt = aesData.salt;
        const aesKey = await generateKey(encoder.encode(password), salt);
        try {
          const decryptedPrivateKey = decoder.decode(await decrypt(aesData, aesKey));
          const decryptedPublicKey = secp.utils.bytesToHex(secp.schnorr.getPublicKey(decryptedPrivateKey));
          console.assert(publicKey === decryptedPublicKey)
          const commonKey = await exportKey(aesKey);
          chrome.storage.session.set({ commonKey });
          setMessage('Password is correct. Save it to session storage.');
          setOpen(true);
        } catch (e) {
          setMessage('Password is wrong! Nothing is changed.');
          setOpen(true);
        }
      } else { // no private key or no public key
        setMessage('No private key.');
        setOpen(true);
      }
    } else { // no private key and no password
      setMessage('Nothing to save.');
      setOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setMessage('');
    setOpen(false);
  }, []);

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>Save</Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} message={message} />
    </>
  );
}

function ClearButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = useCallback(async () => {
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
    setMessage('local storage and session storage are cleared.');
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setMessage('');
    setOpen(false);
  }, []);

  return (
    <>
      <Button sx={{ ml: 1 }} variant="outlined" onClick={handleClick}>Clear</Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} message={message} />
    </>
  );
}

function App() {
  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: 'rgba(21, 183, 185, 1.0)',
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
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h4" sx={typographySx}>nostr-keyx</Typography>
        </Toolbar>
      </AppBar>
      <Container fixed>
        <Paper elevation={6}>
          <Box p={2} mt={2} mb={2} minWidth={240} minHeight={280}>
            <Box>
              <TextField fullWidth id="privatekey" label="Private Key" autoComplete="off" />
            </Box>
            <Box mt={2}>
              <TextField required fullWidth id="password" label="Password" type="password" autoComplete="current-password" />
            </Box>
            <Box mt={2}>
              <SaveButton />
              <ClearButton />
            </Box>
            <Box mt={3}>
              <Link mr={1} href="https://github.com/susumuota/nostr-keyx" target="_blank" rel="noreferrer noopener">
                <img src="icons/github32r.png" alt="GitHub" />
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
