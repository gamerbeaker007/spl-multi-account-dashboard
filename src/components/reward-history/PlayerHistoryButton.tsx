'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCardDetails } from '@/hooks/useCardDetails';
import HistoryIcon from '@mui/icons-material/History';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { PlayerHistoryDialog } from './PlayerHistoryDialog';

interface PlayerHistoryButtonProps {
  username: string;
  seasonId?: number;
}

export function PlayerHistoryButton({ username, seasonId }: PlayerHistoryButtonProps) {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const { getUserToken } = useAuth();
  const { cardDetails } = useCardDetails();

  const userToken = getUserToken(username);

  return (
    <Box height={15} width="100%" sx={{ mb: 2 }}>
      {userToken && (
        <>
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
            seasonId={seasonId ?? 0}
            cardDetails={cardDetails}
          />
        </>
      )}
    </Box>
  );
}
