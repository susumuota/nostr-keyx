// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useMemo } from 'react';
import { AppBar, Box, Container, createTheme, CssBaseline, Link, Paper, Snackbar, ThemeProvider, Toolbar, Typography } from '@mui/material';

import { useStore } from './useStore';
import { AccountSelect } from './AccountSelect';
import { UrlList } from './UrlList';

function App() {
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
          <Box p={2} mt={2} mb={2} minWidth={240} minHeight={280} width={240}>
            <Box mt={1}>
              <AccountSelect />
            </Box>
            <Box mt={1}>
              <UrlList />
            </Box>
            <Box mt={3}>
              <Link mr={1} href="https://github.com/susumuota/nostr-keyx" target="_blank" rel="noreferrer noopener">
                <img src="icons/github32.png" alt="GitHub" />
              </Link>
            </Box>
          </Box>
        </Paper>
        <Snackbar open={isSnackbar} message={message} onClose={handleClose} autoHideDuration={2000} />
      </Container>
    </ThemeProvider>
  );
}

export { App };
