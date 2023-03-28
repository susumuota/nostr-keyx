// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useMemo } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Paper, Box, ThemeProvider, createTheme, Snackbar } from '@mui/material';

import { useStore } from './useStore';
import { RelayList } from './RelayList';

function RelayPage() {
  const message = useStore(state => state.message);
  const isSnackbar = useStore(state => state.isSnackbar);
  const setSnackbar = useStore(state => state.setSnackbar);

  const handleClose = useCallback(() => setSnackbar(false), []);

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

  const appBarStyle = {
    background: 'linear-gradient(to right bottom, rgba(25, 25, 112, 1.0), rgba(21, 183, 185, 1.0)',
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" style={appBarStyle}>
        <Toolbar>
          <Typography variant="h4" sx={typographySx}>Nostr-KeyX</Typography>
        </Toolbar>
      </AppBar>
      <Container fixed>
        <Paper elevation={6}>
          <Box p={2} mt={2} mb={2}>
            <RelayList />
          </Box>
        </Paper>
        <Snackbar open={isSnackbar} message={message} onClose={handleClose} autoHideDuration={5000} />
      </Container>
    </ThemeProvider>
  );
}

export { RelayPage };
