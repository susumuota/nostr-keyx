// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { Icon, IconButton, ListItem, ListItemText, Tooltip } from '@mui/material';
import { useStore } from './useStore';
import { useCallback, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';


function UrlItem({ url }: { url: string }) {
  const urlList = useStore(state => state.urlList);
  const deleteURL = useStore(state => state.deleteURL);
  const showMessage = useStore(state => state.showMessage);
  const [isDialog, setDialog] = useState(false);

  const handleDeleteURL = useCallback(() => {
    setDialog(false);
    if (!urlList.includes(url)) return showMessage('no such URL');
    deleteURL(url);
    showMessage('deleted URL: ' + url);
  }, [url]);

  const handleOpenDialog = useCallback(() => setDialog(true), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  return (
    <ListItem disablePadding>
      <ListItemText primary={url} sx={{ overflow: 'hidden' }} />
      <Tooltip title="Delete this URL">
        <IconButton onClick={handleOpenDialog}>
          <Icon>delete</Icon>
        </IconButton>
      </Tooltip>
      <ConfirmDialog
        title="Delete URL"
        contentText={`Are you sure you want to delete the URL?: ${url}`}
        confirmText="Delete"
        cancelText="Cancel"
        open={isDialog}
        onClick={handleDeleteURL}
        onClose={handleCloseDialog}
      />
    </ListItem>
  );
}

export { UrlItem };
