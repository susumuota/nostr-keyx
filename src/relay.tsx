// SPDX-FileCopyrightText: 2023 Susumu OTA <1632335+susumuota@users.noreply.github.com>
// SPDX-License-Identifier: MIT

import { createRoot } from 'react-dom/client';

import { RelayPage } from './components/RelayPage';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<RelayPage />);
}
