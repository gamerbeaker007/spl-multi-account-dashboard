'use client';

import { usePlayerHistory } from '@/hooks/usePlayerHistory';
import { SplHistory } from '@/types/spl/history';
import { QuestReward } from '@/types/spl/rewardsDailyTypes';
import { Reward } from '@/types/spl/rewardsLeagueSeasonTypes';
import {
  CalendarMonth as CalendarIcon,
  Today as DailyIcon,
  FlashOn as EnergyIcon,
  ExpandMore as ExpandMoreIcon,
  Stars as MeritsIcon,
  CardGiftcard as PackIcon,
  LocalFireDepartment as PotionIcon,
  EmojiEvents as RewardIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

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

  const {
    isLoading,
    error,
    rewardHistory,
    fetchHistory,
    clearHistory,
    clearError,
  } = usePlayerHistory();

  const handleFetchCurrentSeason = async () => {
    await fetchHistory(player, token, currentSeasonId);
  };

  const handleFetchPreviousSeason = async () => {
    await fetchHistory(player, token, currentSeasonId - 1);
  };

  // Parse daily quest results
  const parseDailyQuestResult = (resultString: string) => {
    try {
      const parsed = JSON.parse(resultString);
      if (parsed.quest_data && parsed.quest_data.rewards) {
        const rewardsData =
          typeof parsed.quest_data.rewards === 'string'
            ? JSON.parse(parsed.quest_data.rewards)
            : parsed.quest_data.rewards;
        return {
          ...parsed.quest_data,
          rewards: rewardsData,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Parse claim reward results
  const parseClaimRewardResult = (resultString: string) => {
    try {
      return JSON.parse(resultString);
    } catch {
      return null;
    }
  };

  // Render individual reward with proper icons
  const renderReward = (reward: QuestReward | Reward, index: number) => {
    const getRewardIcon = () => {
      switch (reward.type) {
        case 'pack':
          return <PackIcon color="primary" />;
        case 'frontier_entries':
        case 'ranked_entries':
          return <RewardIcon color="secondary" />;
        case 'potion':
          return <PotionIcon color="warning" />;
        case 'merits':
          return <MeritsIcon color="info" />;
        case 'energy':
          return <EnergyIcon color="success" />;
        case 'reward_card':
          return <RewardIcon color="primary" />;
        default:
          return <RewardIcon />;
      }
    };

    const getRewardText = () => {
      switch (reward.type) {
        case 'pack':
          const packReward = reward as { type: 'pack'; edition: number; quantity: number };
          return `Pack Edition ${packReward.edition} x${packReward.quantity}`;
        case 'frontier_entries':
          return `Frontier Entries x${reward.quantity}`;
        case 'ranked_entries':
          return `Ranked Entries x${reward.quantity}`;
        case 'potion':
          const potionReward = reward as { type: 'potion'; potion_type: string; quantity: number };
          return `${potionReward.potion_type} Potion x${potionReward.quantity}`;
        case 'merits':
          return `Merits x${reward.quantity}`;
        case 'energy':
          return `Energy x${reward.quantity}`;
        case 'reward_card':
          const cardReward = reward as {
            type: 'reward_card';
            card: { card_detail_id: number; gold?: boolean };
          };
          return `Card: ${cardReward.card?.card_detail_id} ${cardReward.card?.gold ? '(Gold)' : ''}`;
        default:
          return `${reward.type} x${reward.quantity}`;
      }
    };

    return (
      <ListItem key={index} dense>
        <ListItemIcon sx={{ minWidth: 32 }}>{getRewardIcon()}</ListItemIcon>
        <ListItemText primary={getRewardText()} primaryTypographyProps={{ variant: 'body2' }} />
      </ListItem>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'claim_reward':
        return <RewardIcon color="primary" />;
      case 'claim_daily':
        return <DailyIcon color="secondary" />;
      default:
        return <CalendarIcon />;
    }
  };

  const getTypeColor = (type: string): 'primary' | 'secondary' | 'default' => {
    switch (type) {
      case 'claim_reward':
        return 'primary';
      case 'claim_daily':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderHistoryEntry = (entry: SplHistory, index: number) => {
    // Try to parse the result for prettier display
    let parsedResult = null;
    let rewards: (QuestReward | Reward)[] = [];

    if (entry.result) {
      if (entry.type === 'claim_daily') {
        parsedResult = parseDailyQuestResult(entry.result);
        if (parsedResult?.rewards?.result?.rewards) {
          rewards = parsedResult.rewards.result.rewards;
        }
      } else if (entry.type === 'claim_reward') {
        parsedResult = parseClaimRewardResult(entry.result);
        if (parsedResult?.rewards) {
          rewards = parsedResult.rewards;
        }
      } else {
        console.error('Unknown history entry type for parsing:', entry.type);
      }
    }

    return (
      <ListItem key={`${entry.block_num}-${index}`} divider>
        <ListItemIcon>{getTypeIcon(entry.type)}</ListItemIcon>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                label={entry.type.replace('_', ' ').toUpperCase()}
                size="small"
                color={getTypeColor(entry.type)}
              />
              <Typography variant="body2" color="text.secondary">
                Block #{entry.block_num}
              </Typography>
              {entry.type === 'claim_daily' && parsedResult && (
                <Chip label={`${parsedResult.name} Quest`} size="small" color="info" />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(entry.created_date)}
              </Typography>

              {/* Show parsed rewards if available */}
              {rewards.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Rewards:
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {rewards.map((reward, idx) => renderReward(reward, idx))}
                  </List>
                </Box>
              )}

              {/* Fallback to raw JSON if no parsed rewards */}
              {rewards.length === 0 && entry.result && (
                <Box mt={1}>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      p: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      maxHeight: '100px',
                      overflow: 'auto',
                    }}
                  >
                    {typeof entry.result === 'string'
                      ? entry.result
                      : JSON.stringify(entry.result, null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>
    );
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
                  {new Date(rewardHistory.dateRange.start).toLocaleDateString()} -{' '}
                  {new Date(rewardHistory.dateRange.end).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* History List */}
        {rewardHistory && rewardHistory?.entries.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                History Entries ({rewardHistory.entries.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {rewardHistory.entries.map((entry, index) => renderHistoryEntry(entry, index))}
              </List>
            </AccordionDetails>
          </Accordion>
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
