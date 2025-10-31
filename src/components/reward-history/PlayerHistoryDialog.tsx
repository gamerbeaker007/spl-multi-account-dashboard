'use client';

import { usePlayerHistory } from '@/hooks/usePlayerHistory';
import { EmojiEvents as RewardIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { RewardHistorySummary } from './RewardHistorySummary';
interface PlayerHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  player: string;
  token: string;
  seasonId: number;
}

export function PlayerHistoryDialog({
  open,
  onClose,
  player,
  token,
  seasonId,
}: PlayerHistoryDialogProps) {
  const [currentSeasonId] = useState(seasonId);

  const { isLoading, error, rewardHistory, fetchHistory, clearHistory, clearError } =
    usePlayerHistory();

  const handleFetchCurrentSeason = async () => {
    await fetchHistory(player, token, currentSeasonId);
  };

  const handleFetchPreviousSeason = async () => {
    await fetchHistory(player, token, currentSeasonId - 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Season Rewards - {player}</DialogTitle>

      <DialogContent>
        {/* Season Controls */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom></Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="outlined"
              onClick={handleFetchPreviousSeason}
              disabled={isLoading}
              startIcon={<RewardIcon />}
              sx={{ minWidth: 180 }}
              color="secondary"
            >
              {isLoading ? 'Fetching...' : `Previous Season ${currentSeasonId - 1}`}
            </Button>
            <Button
              variant="contained"
              onClick={handleFetchCurrentSeason}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <RewardIcon />}
              sx={{ minWidth: 180 }}
              color="primary"
            >
              {isLoading ? 'Fetching...' : `Current Season ${currentSeasonId}`}
            </Button>
          </Stack>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Results Summary */}
        {rewardHistory && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fetch Results
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box>
                <Typography variant="body2">
                  <strong>Total Entries:</strong> {rewardHistory.totalEntries}
                </Typography>
                <Typography variant="body2">
                  <strong>Date Range:</strong>{' '}
                  {rewardHistory?.dateRange?.start
                    ? new Date(rewardHistory.dateRange.start).toLocaleDateString()
                    : 'N/A'}{' '}
                  -{' '}
                  {rewardHistory?.dateRange?.end
                    ? new Date(rewardHistory.dateRange.end).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {rewardHistory && rewardHistory?.entries.length > 0 && (
          <RewardHistorySummary rewardHistory={rewardHistory} />
        )}

        {/* Loading State */}
        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && history.length === 0 && !error && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No history data available. Select a date range and click &ldquo;Fetch History&rdquo;
              to load data.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {history.length > 0 && (
          <Button onClick={clearHistory} color="secondary">
            Clear History
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
