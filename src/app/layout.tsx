'use client';

import MuiThemeProvider from '@/components/ThemeProvider';
import { UsernameProvider } from '@/contexts/UsernameContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>
          <UsernameProvider>{children}</UsernameProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
