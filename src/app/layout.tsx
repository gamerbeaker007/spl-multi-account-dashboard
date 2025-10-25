'use client';

import MuiThemeProvider from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { UsernameProvider } from '@/contexts/UsernameContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MuiThemeProvider>
            <UsernameProvider>{children}</UsernameProvider>
          </MuiThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
