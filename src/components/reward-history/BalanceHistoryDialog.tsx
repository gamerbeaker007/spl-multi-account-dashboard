'use client';

import { useSeasonsContext } from '@/contexts/SeasonsContext';
import { TokenProgress, useBalanceHistory } from '@/hooks/useBalanceHistory';
import { SplSeasonInfo } from '@/types/spl/season';
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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { BalanceHistorySection } from './BalanceHistorySection';

const OLD_SEASON_THRESHOLD = 5;

interface BalanceHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  player: string;
  token: string;
  seasonId: number;
  joinDate?: string;
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

function seasonLabel(s: SplSeasonInfo, currentSeasonId: number): string {
  const date = new Date(s.ends).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const suffix =
    s.id === currentSeasonId ? ' (Current)' : s.id === currentSeasonId - 1 ? ' (Previous)' : '';
  return `Season ${s.id} — ends ${date}${suffix}`;
}

export function BalanceHistoryDialog({
  open,
  onClose,
  player,
  token,
  seasonId,
  joinDate,
}: Readonly<BalanceHistoryDialogProps>) {
  const [currentSeasonId] = useState(seasonId);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | ''>('');
  const { getSeasonsSince, isLoading: seasonsLoading } = useSeasonsContext();
  const {
    isLoading,
    error,
    balanceHistory,
    progress,
    fetchBalanceHistory,
    clearBalanceHistory,
    clearError,
  } = useBalanceHistory();

  const seasons = joinDate ? getSeasonsSince(joinDate) : [];

  const handleFetchCurrentSeason = () => {
    setSelectedSeasonId('');
    fetchBalanceHistory(player, token, currentSeasonId);
  };
  const handleFetchPreviousSeason = () => {
    setSelectedSeasonId('');
    fetchBalanceHistory(player, token, currentSeasonId - 1);
  };
  const handleFetchSelectedSeason = () => {
    if (selectedSeasonId !== '') fetchBalanceHistory(player, token, selectedSeasonId);
  };

  const loadedSeasonId = balanceHistory?.seasonId ?? null;
  const prevLoaded = loadedSeasonId === currentSeasonId - 1;
  const currLoaded = loadedSeasonId === currentSeasonId;
  const noneLoaded = loadedSeasonId === null;
  const selectedLoaded = selectedSeasonId !== '' && loadedSeasonId === selectedSeasonId;

  const isOldSeason =
    selectedSeasonId !== '' &&
    currentSeasonId - (selectedSeasonId as number) > OLD_SEASON_THRESHOLD;

  const doneCount = progress.filter(p => p.status === 'done' || p.status === 'error').length;
  const totalCount = progress.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Balance History — {player}</DialogTitle>

      <DialogContent>
        {/* Fetch Controls */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button
                variant={prevLoaded ? 'contained' : 'outlined'}
                onClick={handleFetchPreviousSeason}
                disabled={isLoading || currentSeasonId <= 1}
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ minWidth: 180 }}
                color={prevLoaded ? 'success' : 'secondary'}
              >
                {isLoading && prevLoaded
                  ? 'Fetching…'
                  : currentSeasonId > 1
                    ? `Previous Season ${currentSeasonId - 1}`
                    : 'No Previous Season'}
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

            {/* Season picker — all seasons since player join date */}
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 280 }} disabled={isLoading}>
                <InputLabel>Older season</InputLabel>
                <Select
                  value={selectedSeasonId}
                  label="Older season"
                  onChange={e => setSelectedSeasonId(e.target.value as number)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                >
                  {seasonsLoading && (
                    <MenuItem disabled>
                      <CircularProgress size={14} sx={{ mr: 1 }} /> Loading seasons…
                    </MenuItem>
                  )}
                  {seasons.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {seasonLabel(s, currentSeasonId)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant={selectedLoaded ? 'contained' : 'outlined'}
                onClick={handleFetchSelectedSeason}
                disabled={isLoading || selectedSeasonId === ''}
                startIcon={
                  isLoading && selectedLoaded ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AccountBalanceWalletIcon />
                  )
                }
                color={selectedLoaded ? 'success' : 'secondary'}
              >
                {isLoading && selectedLoaded ? 'Fetching…' : 'Load'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Old season warning */}
        {isOldSeason && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Season {selectedSeasonId} is far in the past — fetching may take longer due to the
            amount of history to paginate through.
          </Alert>
        )}

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
