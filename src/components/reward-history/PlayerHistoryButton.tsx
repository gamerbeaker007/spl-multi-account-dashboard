'use client';

import { useUsernameContext } from '@/contexts/UsernameContext';
import { useCardDetails } from '@/hooks/useCardDetails';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import { Box, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { BalanceHistoryDialog } from './BalanceHistoryDialog';
import { PlayerHistoryDialog } from './PlayerHistoryDialog';

interface PlayerHistoryButtonProps {
  username: string;
  seasonId?: number;
  joinDate?: string;
}

export function PlayerHistoryButton({ username, seasonId, joinDate }: PlayerHistoryButtonProps) {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const { getUserToken } = useUsernameContext();
  const { cardDetails } = useCardDetails();

  const userToken = getUserToken(username);

  return (
    <Box width="100%" sx={{ mb: 2 }}>
      {userToken && (
        <>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setHistoryDialogOpen(true)}
              fullWidth
              color="secondary"
              size="small"
            >
              Reward History
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={() => setBalanceDialogOpen(true)}
              fullWidth
              color="secondary"
              size="small"
            >
              Balance History
            </Button>
          </Stack>

          <PlayerHistoryDialog
            open={historyDialogOpen}
            onClose={() => setHistoryDialogOpen(false)}
            player={username}
            token={userToken}
            seasonId={seasonId ?? 0}
            cardDetails={cardDetails}
          />
          <BalanceHistoryDialog
            open={balanceDialogOpen}
            onClose={() => setBalanceDialogOpen(false)}
            player={username}
            token={userToken}
            seasonId={seasonId ?? 0}
            joinDate={joinDate}
          />
        </>
      )}
    </Box>
  );
}
