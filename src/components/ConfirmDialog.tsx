// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type ConfirmDialogProps = {
  title: string,
  contentText: string,
  confirmText: string,
  cancelText: string,
  open: boolean,
  onClick: () => void,
  onClose: () => void,
};

function ConfirmDialog({ title, contentText, confirmText, cancelText, open, onClick, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        <DialogActions>
          <Button variant="outlined" onClick={onClick} autoFocus>{confirmText}</Button>
          <Button variant="outlined" onClick={onClose}>{cancelText}</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmDialog };
