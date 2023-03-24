// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Paper, Box, ThemeProvider, createTheme, Button } from '@mui/material';

import { useStore } from './components/useStore';

const getOrigin = () => {
  const sp = new URLSearchParams(document.location.search);
  return sp.get('origin');
};

const removeTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.remove(tab.id);
  }
};

const switchTab = async () => {
  const origin = getOrigin();
  if (!origin) return;
  const [originTab] = await chrome.tabs.query({ url: `${origin}/*` });
  if (originTab && originTab.id) {
    chrome.tabs.update(originTab.id, { active: true });
  }
};

function App() {
  const addURL = useStore(state => state.addURL);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: 'rgba(25, 25, 112, 1.0)',
        contrastText: 'rgba(255, 255, 255, 1.0)',
      },
    },
  }), []);

  const handleAccept = useCallback(() => {
    const origin = getOrigin();
    if (origin) addURL(origin);
    (async () => {
      await removeTab();
      await switchTab();
    })();
  }, []);

  const handleDeny = useCallback(() => {
    (async () => {
      await removeTab();
      await switchTab();
    })();
  }, []);

  const typographySx = {
    m: 'auto',
    mt: 1.2,
    color: 'primary.contrastText',
    fontFamily: '"Bowlby One SC", "Roboto", sans-serif',
  };

  const origin = getOrigin();

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
          <Box p={2} mt={2} mb={2}>
            <Box>
              Do you allow <strong>{origin}</strong> to access NIP-07 functions?
            </Box>
            <Box mt={2}>
              <Button variant="outlined" onClick={handleAccept}>Allow</Button>
              <Button variant="outlined" onClick={handleDeny} sx={{ ml: 2 }}>Deny</Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
