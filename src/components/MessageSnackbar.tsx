// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback } from 'react';
import { Snackbar } from '@mui/material';

import { useStore } from "./useStore";

function MessageSnackbar() {
  const message = useStore(state => state.message);
  const setMessage = useStore(state => state.setMessage);
  const isSnackbar = useStore(state => state.isSnackbar);
  const setSnackbar = useStore(state => state.setSnackbar);

  const closeSnackbar = useCallback(() => {
    setMessage('');
    setSnackbar(false);
  }, []);

  return (
    <Snackbar open={isSnackbar} autoHideDuration={2000} onClose={closeSnackbar} message={message} />
  );
}

export { MessageSnackbar };
