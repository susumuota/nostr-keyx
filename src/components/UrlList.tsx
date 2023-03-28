// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useState } from 'react';
import { Box, Divider, Icon, IconButton, List, Tooltip, Typography } from '@mui/material';

import { useStore } from './useStore';
import { NewItemDrawer } from './NewItemDrawer';
import { ConfirmDialog } from './ConfirmDialog';
import { UrlItem } from './UrlItem';

const isURL = (str: string) => {
  try {
    new URL(str);
  } catch (err: any) {
    console.debug('invalid URL: ', err);
    return false;
  }
  return true;
}

function UrlList() {
  const urlList = useStore(state => state.urlList);
  const addURL = useStore(state => state.addURL);
  const restoreURLList = useStore(state => state.restoreURLList);
  const showMessage = useStore(state => state.showMessage);
  const [isDrawer, setDrawer] = useState(false);
  const [isDialog, setDialog] = useState(false);

  const handleNewURL = useCallback((newURL: string) => {
    if (!newURL) {
      showMessage('empty URL');
      return false;
    }
    if (!isURL(newURL)) {
      showMessage('invalid URL');
      return false;
    }
    const url = new URL(newURL);
    if (urlList.includes(url.origin)) {
      showMessage('already exists');
      return false;
    }
    addURL(url.origin);
    setDrawer(false);
    showMessage('added URL: ' + url.origin);
    return true;
  }, [urlList]);

  const handleRestore = useCallback(() => {
    restoreURLList();
    setDialog(false);
    showMessage('restored to default');
  }, []);

  const handleOpenDrawer = useCallback(() => setDrawer(true), []);
  const handleCloseDrawer = useCallback(() => setDrawer(false), []);
  const handleOpenDialog = useCallback(() => setDialog(true), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  return (
    <Box>
      <Typography variant="inherit">NIP-07 Allow List</Typography>
      <List>
        <Divider />
        {urlList.map((url, index) => <UrlItem key={index} url={url} />)}
        <Divider />
      </List>
      <Box sx={{ display: 'flex' }}>
        <Box component="span" sx={{ flexGrow: 1 }} />
        <Tooltip title="Add a new URL">
          <IconButton onClick={handleOpenDrawer}>
            <Icon>add</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Restore to default">
          <IconButton onClick={handleOpenDialog}>
            <Icon>restore_page</Icon>
          </IconButton>
        </Tooltip>
      </Box>
      <NewItemDrawer
        title="Enter a new URL."
        label="New URL"
        open={isDrawer}
        onClick={handleNewURL}
        onClose={handleCloseDrawer}
        validator={() => true}
      />
      <ConfirmDialog
        title="Restore to default"
        contentText="Are you sure you want to restore to default?"
        confirmText="Restore"
        cancelText="Cancel"
        open={isDialog}
        onClick={handleRestore}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}

export { UrlList };
