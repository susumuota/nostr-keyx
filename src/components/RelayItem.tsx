// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useState } from 'react';
import { ListItem, ListItemText, Tooltip, IconButton, Icon, Switch, FormGroup, FormControlLabel } from '@mui/material';

import { useStore } from './useStore';
import { ConfirmDialog } from './ConfirmDialog';

function RelayItem({ url }: { url: string }) {
  const getRelay = useStore(state => state.getRelay);
  const toggleReadRelay = useStore(state => state.toggleReadRelay);
  const toggleWriteRelay = useStore(state => state.toggleWriteRelay);
  const deleteRelay = useStore(state => state.deleteRelay);
  const showMessage = useStore(state => state.showMessage);
  const [isDialog, setDialog] = useState(false);

  const handleDeleteRelay = useCallback(() => {
    setDialog(false);
    if (!getRelay(url)) return showMessage('no such Relay');
    deleteRelay(url);
    showMessage('deleted Relay: ' + url);
  }, [url]);

  const handleOpenDialog = useCallback(() => setDialog(true), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  const toggleRead = useCallback(() => toggleReadRelay(url), [url]);
  const toggleWrite = useCallback(() => toggleWriteRelay(url), [url]);

  const sx = {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    '&:hover': {
      overflow: 'visible',
    }
  };

  const relay = getRelay(url);
  const isRead = relay?.policy.read ?? true;
  const isWrite = relay?.policy.write ?? true;

  return (
    <ListItem disablePadding>
      <ListItemText primary={url} sx={sx} />
      <FormGroup>
        <FormControlLabel labelPlacement="start" label="Read" control={
          <Switch sx={{ m: 1 }} checked={isRead} onChange={toggleRead} size="small" edge="end" />
        } />
      </FormGroup>
      <FormGroup>
        <FormControlLabel labelPlacement="start" label="Write" control={
          <Switch sx={{ m: 1 }} checked={isWrite} onChange={toggleWrite} size="small" edge="end" />
        } />
      </FormGroup>
      <Tooltip title="Delete this Relay">
        <IconButton sx={{ ml: 1 }} onClick={handleOpenDialog}>
          <Icon>delete</Icon>
        </IconButton>
      </Tooltip>
      <ConfirmDialog
        title="Delete Relay"
        contentText={`Are you sure you want to delete the Relay?: ${url}`}
        confirmText="Delete"
        cancelText="Cancel"
        open={isDialog}
        onClick={handleDeleteRelay}
        onClose={handleCloseDialog}
      />
    </ListItem>
  );
}

export { RelayItem };
