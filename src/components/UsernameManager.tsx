import { useAuth } from '@/contexts/AuthContext';
import { useUsernameContext } from '@/contexts/UsernameContext';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { MdLockPerson } from 'react-icons/md';

interface UsernameManagerProps {
  onFetchData: () => void;
  loading?: boolean;
}

export default function UsernameManager({
  onFetchData,
  loading = false,
}: UsernameManagerProps) {
  const {
    usernames,
    addUsername,
    removeUsername,
    setUsernames,
    isInitialized,
  } = useUsernameContext();
  const { loginUser } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [authorizingAll, setAuthorizingAll] = useState(false);
  const [, setAuthResults] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }

    if (usernames.includes(trimmedUsername)) {
      setError('Username already exists');
      return;
    }

    addUsername(trimmedUsername);
    setNewUsername('');
    setError('');
  };

  const handleRemoveUsername = (usernameToRemove: string) => {
    removeUsername(usernameToRemove);
  };

  const handleClearAll = () => {
    setUsernames([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleAuthorizeAll = async () => {
    if (!usernames.length) return;

    setAuthorizingAll(true);
    setAuthResults({});

    // Reset previous results
    const results: Record<string, string> = {};

    for (const username of usernames) {
      try {
        await loginUser(username);

        // If loginUser doesn't throw an error, it was successful
        results[username] = 'success';
      } catch (error) {
        // Store the error message for display instead of console logging
        const errorMsg =
          error instanceof Error ? error.message : 'Login failed';
        results[username] = errorMsg;
      }

      // Update results after each attempt
      setAuthResults({ ...results });

      // Small delay between requests to avoid overwhelming
      if (usernames.indexOf(username) < usernames.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setAuthorizingAll(false);
    onFetchData();
  };

  if (!isInitialized) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manage Player Usernames
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Add Username Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                gap: 1,
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <TextField
                size="small"
                label="Enter username"
                value={newUsername}
                onChange={e => {
                  setNewUsername(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                error={!!error}
                helperText={error}
                sx={{ minWidth: 200, maxWidth: 400, flex: 1 }}
              />
              <Button
                size="medium"
                type="submit"
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!newUsername.trim() || loading}
              >
                Add
              </Button>
              <Button
                size="medium"
                variant="outlined"
                onClick={handleAuthorizeAll}
                startIcon={<MdLockPerson />}
                disabled={!usernames.length || loading || authorizingAll}
              >
                {authorizingAll ? 'Authorizing...' : 'Authorize All'}
              </Button>

              {usernames.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleClearAll}
                  color="error"
                  size="medium"
                >
                  Clear All
                </Button>
              )}
              {/* Fetch Data Button */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<RefreshIcon />}
                  onClick={onFetchData}
                  disabled={usernames.length === 0 || loading}
                  size="medium"
                >
                  {loading ? 'Fetching...' : 'Fetch Data'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Current Usernames */}
          {usernames.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Players ({usernames.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {usernames.map(username => (
                  <Chip
                    key={username}
                    label={username}
                    onDelete={() => handleRemoveUsername(username)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Instructions */}
          {usernames.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Add player usernames above and click &quot;Fetch Data&quot; to
                load their balances, draws, and leaderboard positions.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}
