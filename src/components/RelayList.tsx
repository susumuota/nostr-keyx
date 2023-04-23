// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { useCallback, useState } from 'react';
import { Typography, Box, Divider, List, Tooltip, IconButton, Icon } from '@mui/material';

import type { Relay } from '../common';
import { useStore } from './useStore';
import { NewItemDrawer } from './NewItemDrawer';
import { ConfirmDialog } from './ConfirmDialog';
import { RelayItem } from './RelayItem';

const isURL = (str: string) => {
  try {
    new URL(str);
  } catch (err: any) {
    console.log('invalid URL: ', err);
    return false;
  }
  return true;
}

function RelayList() {
  const relayList = useStore(state => state.relayList);
  const getRelay = useStore(state => state.getRelay);
  const addRelay = useStore(state => state.addRelay);
  const clearRelayList = useStore(state => state.clearRelayList);
  const restoreRelayList = useStore(state => state.restoreRelayList);
  const showMessage = useStore(state => state.showMessage);
  const [isDrawer, setDrawer] = useState(false);
  const [isDialog, setDialog] = useState(false);

  const handleNewRelay = useCallback((newRelay: string) => {
    if (!newRelay) {
      showMessage('empty Relay');
      return false;
    }
    if (!isURL(newRelay)) {
      showMessage('invalid Relay');
      return false;
    }
    if (getRelay(newRelay)) {
      showMessage('already exists');
      return false;
    }
    addRelay(newRelay, true, true);
    setDrawer(false);
    showMessage('added Relay: ' + newRelay);
    return true;
  }, []);

  const handleRestore = useCallback(() => {
    restoreRelayList();
    setDialog(false);
    showMessage('restored to default');
  }, [relayList]);

  const handleCopy = useCallback(() => {
    const relays = {} as { [url: string]: { read: boolean, write: boolean } };
    relayList.forEach((r: Relay) => {
      relays[r.url] = { read: r.policy.read, write: r.policy.write };
    });
    navigator.clipboard.writeText(JSON.stringify(relays, null, '  ') + '\n');
    showMessage('copied to clipboard');
  }, [relayList]);

  const handlePaste = useCallback(() => {
    // TODO: refactor
    (async () => {
      try {
        // read from clipboard
        const text = await navigator.clipboard.readText();
        // parse
        const relays = JSON.parse(text) as { [url: string]: { read: boolean, write: boolean } };
        if (!relays) {
          showMessage('empty or invalid relay format');
          return;
        }
        // check format
        let result = true;
        Object.entries(relays).forEach(([url, policy]) => {
          if (url && isURL(url) && policy && 'read' in policy && 'write' in policy) {
            // OK
          } else {
            console.log('invalid relay format: ', url, policy);
            showMessage('invalid relay format: ' + JSON.stringify(url) + ': ' + JSON.stringify(policy));
            result = false;
          }
        });
        if (!result) return;
        // clear and add
        clearRelayList();
        Object.entries(relays).forEach(([url, policy]) => {
          addRelay(url, policy.read, policy.write);
        });
        showMessage('pasted from clipboard');
      } catch (err: any) {
        console.debug('failed to paste from clipboard: ', err);
        showMessage('failed to paste from clipboard: ' + err);
      }
    })();
  }, [relayList]);

  const handleOpenDrawer = useCallback(() => setDrawer(true), []);
  const handleCloseDrawer = useCallback(() => setDrawer(false), []);
  const handleOpenDialog = useCallback(() => setDialog(true), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  return (
    <Box>
      <Box sx={{ display: 'flex' }}>
        <Typography variant="inherit" m="auto">Relay List</Typography>
        <Box component="span" sx={{ flexGrow: 1 }} />
        <Tooltip title="Recommended relays">
          <IconButton onClick={() => chrome.tabs.create({ url: 'https://github.com/susumuota/nostr-keyx/blob/main/src/common.ts' })}>
            <Icon>info</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy to clipboard">
          <IconButton onClick={handleCopy}>
            <Icon>content_copy</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Paste from clipboard">
          <IconButton onClick={handlePaste}>
            <Icon>content_paste</Icon>
          </IconButton>
        </Tooltip>
      </Box>
      <List>
        <Divider />
        {relayList.map((relay, index) => (
          <RelayItem key={index} url={relay.url} />
        ))}
        <Divider />
      </List>
      <Box sx={{ display: 'flex' }}>
        <Box component="span" sx={{ flexGrow: 1 }} />
        <Tooltip title="Add a new Relay">
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
        title="Enter a new Relay. e.g. wss://relay.example.com"
        label="New Relay"
        open={isDrawer}
        onClick={handleNewRelay}
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

export { RelayList };
