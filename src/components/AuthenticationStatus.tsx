import { useAuth } from '@/contexts/AuthContext';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box, Button, Chip, Tooltip } from '@mui/material';
import { useState } from 'react';

interface Props {
  username: string;
}

export const AuthenticationStatus = ({ username }: Props) => {
  const { isUserAuthenticated, loginUser, logoutUser, loading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = isUserAuthenticated(username);

  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      setLoginError(null);
      await loginUser(username);
    } catch (error) {
      // Don't log to console - just show user-friendly message
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(username);
      setLoginError(null); // Clear any previous login errors
    } catch (error) {
      // Logout failures are less common, but still handle gracefully
      setLoginError(error instanceof Error ? error.message : 'Logout failed');
    }
  };

  if (isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="User is authenticated - can access daily progress">
          <Chip
            icon={<LockOpenIcon />}
            label="Authenticated"
            color="success"
            size="small"
            variant="outlined"
          />
        </Tooltip>
        {isAuthenticated && (
          <Box
            maxWidth={20}
            minWidth={20}
            alignContent={'center'}
            justifyContent={'center'}
            sx={{ flexGrow: 1 }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={loading}
            />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="User not authenticated - login to access daily progress">
          <Chip
            icon={<LockIcon />}
            label="Not Authenticated"
            color={loginError ? 'error' : 'warning'}
            size="small"
            variant="outlined"
          />
        </Tooltip>
        <Button
          size="small"
          variant="outlined"
          startIcon={<LoginIcon />}
          onClick={handleLogin}
          disabled={loading || loggingIn}
          color={loginError ? 'error' : 'primary'}
        >
          {loggingIn ? 'Logging in...' : 'Login'}
        </Button>
      </Box>

      {/* Show login error if present */}
      {loginError && (
        <Chip
          label={loginError}
          color="error"
          size="small"
          variant="filled"
          onDelete={() => setLoginError(null)}
        />
      )}
    </Box>
  );
};
