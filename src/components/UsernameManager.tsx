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
import React, { useEffect, useState } from 'react';

interface UsernameManagerProps {
  onUsernamesChange: (usernames: string[]) => void;
  onFetchData: () => void;
  loading?: boolean;
}

const STORAGE_KEY = 'spl-dashboard-usernames';

// Custom hook to handle localStorage with hydration safety
function useLocalStorageState(key: string, defaultValue: string[]) {
  const [state, setState] = useState<string[]>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedUsernames = JSON.parse(stored);
        if (Array.isArray(parsedUsernames)) {
          setState(parsedUsernames);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const setValue = (newValue: string[]) => {
    setState(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [state, setValue, isInitialized] as const;
}

export default function UsernameManager({
  onUsernamesChange,
  onFetchData,
  loading = false,
}: UsernameManagerProps) {
  const [userInput, setUserInput] = useState('');
  const [usernames, setUsernames, isInitialized] = useLocalStorageState(
    STORAGE_KEY,
    []
  );

  // Notify parent when usernames are loaded and component is initialized
  useEffect(() => {
    if (isInitialized && usernames.length > 0) {
      onUsernamesChange(usernames);
    }
  }, [isInitialized, usernames, onUsernamesChange]);

  // Prevent hydration mismatch by not rendering localStorage-dependent content until initialized
  if (!isInitialized) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manage Players
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Loading...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Save usernames to localStorage whenever they change
  const saveUsernames = (newUsernames: string[]) => {
    setUsernames(newUsernames);
    onUsernamesChange(newUsernames);
  };

  const handleAddUser = () => {
    const trimmedInput = userInput.trim();
    if (trimmedInput && !usernames.includes(trimmedInput)) {
      const newUsernames = [...usernames, trimmedInput];
      saveUsernames(newUsernames);
      setUserInput('');
    }
  };

  const handleRemoveUser = (username: string) => {
    const newUsernames = usernames.filter(u => u !== username);
    saveUsernames(newUsernames);
  };

  const handleClearAll = () => {
    saveUsernames([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddUser();
    }
  };

  const isDuplicate = Boolean(
    userInput.trim() && usernames.includes(userInput.trim())
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manage Players
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="Username"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{ minWidth: 200 }}
              error={isDuplicate}
              helperText={isDuplicate ? 'Username already added' : ''}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleAddUser}
              startIcon={<AddIcon />}
              disabled={!userInput.trim() || isDuplicate}
              size="small"
            >
              Add Player
            </Button>

            <Button
              variant="outlined"
              onClick={onFetchData}
              disabled={usernames.length === 0 || loading}
              startIcon={<RefreshIcon />}
              size="small"
            >
              {loading ? 'Loading...' : `Fetch Data (${usernames.length})`}
            </Button>

            {usernames.length > 0 && (
              <Button
                variant="text"
                onClick={handleClearAll}
                color="error"
                size="small"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {usernames.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Players ({usernames.length}):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {usernames.map(username => (
                <Chip
                  key={username}
                  label={username}
                  onDelete={() => handleRemoveUser(username)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {usernames.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Add Splinterlands usernames to get started. They&apos;ll be saved
            automatically!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
