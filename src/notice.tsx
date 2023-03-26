// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Paper, Box, ThemeProvider, createTheme } from '@mui/material';

function App() {
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
          <Box p={2} mt={2} mb={2}>
            <Box>
              Hi! Thank you for installing nostr-keyx!
            </Box>
            <Box>
              Please follow the <a href="https://github.com/susumuota/nostr-keyx#install">instructions</a> on GitHub to set up the native scripts.
            </Box>
            <Box>
              Before you go, copy the extension ID <strong>{chrome.runtime.id}</strong> to your clipboard. We will use it later.
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
