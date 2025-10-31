'use client';

import { useAuth } from '@/contexts/AuthContext';
import HistoryIcon from '@mui/icons-material/History';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { PlayerHistoryDialog } from './PlayerHistoryDialog';

interface PlayerHistoryButtonProps {
  username: string;
  seasonId: number;
}

export function PlayerHistoryButton({ username, seasonId }: PlayerHistoryButtonProps) {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const { getUserToken, isUserAuthenticated } = useAuth();

  const isAuthorized = isUserAuthenticated(username);

  if (!isAuthorized) {
    return null; // Don't show anything if not authorized
  }

  const userToken = getUserToken(username);
  if (!userToken) {
    return null; // Don't show if no token available
  }

  return (
    <Box width="100%" sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<HistoryIcon />}
        onClick={() => setHistoryDialogOpen(true)}
        fullWidth
        color="secondary"
        size="small"
      >
        View Reward History
      </Button>

      <PlayerHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        player={username}
        token={userToken}
        seasonId={seasonId}
      />
    </Box>
  );
}
