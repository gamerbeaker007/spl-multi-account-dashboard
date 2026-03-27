'use client';

import { TokenProgress, useBalanceHistory } from '@/hooks/useBalanceHistory';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { BalanceHistorySection } from './BalanceHistorySection';

interface BalanceHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  player: string;
  token: string;
  seasonId: number;
}

function TokenChip({ p }: { p: TokenProgress }) {
  const statusIcon =
    p.status === 'done' ? (
      <CheckCircleIcon fontSize="small" color="success" />
    ) : p.status === 'fetching' ? (
      <CircularProgress size={14} />
    ) : p.status === 'error' ? (
      <ErrorIcon fontSize="small" color="error" />
    ) : (
      <HourglassEmptyIcon fontSize="small" color="disabled" />
    );

  const label = p.status === 'fetching' ? `${p.token} …` : p.token;

  return (
    <Tooltip title={p.errorMessage ?? ''} placement="top">
      <Chip
        icon={statusIcon}
        label={label}
        size="small"
        variant={p.status === 'done' ? 'filled' : 'outlined'}
        color={p.status === 'done' ? 'success' : p.status === 'error' ? 'error' : 'default'}
      />
    </Tooltip>
  );
}

export function BalanceHistoryDialog({
  open,
  onClose,
  player,
  token,
  seasonId,
}: BalanceHistoryDialogProps) {
  const [currentSeasonId] = useState(seasonId);
  const {
    isLoading,
    error,
    balanceHistory,
    progress,
    fetchBalanceHistory,
    clearBalanceHistory,
    clearError,
  } = useBalanceHistory();

  const handleFetchCurrentSeason = () => fetchBalanceHistory(player, token, currentSeasonId);
  const handleFetchPreviousSeason = () => fetchBalanceHistory(player, token, currentSeasonId - 1);

  const loadedSeasonId = balanceHistory?.seasonId ?? null;
  const prevLoaded = loadedSeasonId === currentSeasonId - 1;
  const currLoaded = loadedSeasonId === currentSeasonId;
  const noneLoaded = loadedSeasonId === null;

  const doneCount = progress.filter(p => p.status === 'done' || p.status === 'error').length;
  const totalCount = progress.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Balance History — {player}</DialogTitle>

      <DialogContent>
        {/* Fetch Controls */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant={prevLoaded ? 'contained' : 'outlined'}
              onClick={handleFetchPreviousSeason}
              disabled={isLoading}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{ minWidth: 180 }}
              color={prevLoaded ? 'success' : 'secondary'}
            >
              {isLoading && prevLoaded ? 'Fetching…' : `Previous Season ${currentSeasonId - 1}`}
            </Button>
            <Button
              variant={currLoaded || noneLoaded ? 'contained' : 'outlined'}
              onClick={handleFetchCurrentSeason}
              disabled={isLoading}
              startIcon={
                isLoading && (currLoaded || noneLoaded) ? (
                  <CircularProgress size={20} />
                ) : (
                  <AccountBalanceWalletIcon />
                )
              }
              sx={{ minWidth: 180 }}
              color={currLoaded ? 'success' : noneLoaded ? 'primary' : 'secondary'}
            >
              {isLoading && (currLoaded || noneLoaded)
                ? 'Fetching…'
                : `Current Season ${currentSeasonId}`}
            </Button>
          </Stack>
        </Paper>

        {/* Progress chips */}
        {progress.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            {isLoading && (
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Fetching token {doneCount + 1} of {totalCount}…
              </Typography>
            )}
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {progress.map(p => (
                <TokenChip key={p.token} p={p} />
              ))}
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {!isLoading && !balanceHistory && !error && progress.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">Select a season to load balance history.</Typography>
          </Box>
        )}

        {balanceHistory && <BalanceHistorySection balanceHistory={balanceHistory} />}
      </DialogContent>

      <DialogActions>
        {balanceHistory && (
          <Button onClick={clearBalanceHistory} color="secondary">
            Clear
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
