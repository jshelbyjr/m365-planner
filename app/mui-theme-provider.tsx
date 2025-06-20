'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
