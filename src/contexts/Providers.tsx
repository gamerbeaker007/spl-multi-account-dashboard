'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { UsernameProvider } from '@/contexts/UsernameContext';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: ['var(--font-geist-sans)', 'Arial', 'sans-serif'].join(','),
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UsernameProvider>{children}</UsernameProvider>
        {/*{children}*/}
      </ThemeProvider>
    </AuthProvider>
  );
}
