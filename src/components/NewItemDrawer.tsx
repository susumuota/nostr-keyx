// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { ChangeEvent, useCallback, useState } from 'react';
import { Box, Button, Container, Drawer, Paper, TextField } from '@mui/material';

type NewItemDrawerProps = {
  title: string,
  label: string,
  open: boolean,
  onClick: (item: string) => boolean,
  onClose: () => void,
  validator: (item: string) => boolean,
};

function NewItemDrawer({ title, label, open, onClick, onClose, validator }: NewItemDrawerProps) {
  const [newItem, setNewItem] = useState('');

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value && !validator(value)) return;
    setNewItem(value);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick(newItem)) setNewItem('');
  }, [newItem]);

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Container fixed>
        <Paper elevation={6}>
          <Box p={2} mt={2} mb={2} minWidth={240}>
            <Box>
              {title}
            </Box>
            <Box mt={2}>
              <TextField label={label} value={newItem} onChange={handleChange} autoComplete="off" autoFocus />
            </Box>
            <Box mt={2}>
              <Button variant="outlined" onClick={handleClick}>Add</Button>
              <Button sx={{ ml: 2 }} variant="outlined" onClick={onClose}>Cancel</Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Drawer>
  );
}

export { NewItemDrawer };
