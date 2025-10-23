'use client';

import MuiThemeProvider from '@/components/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </body>
    </html>
  );
}
