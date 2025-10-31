import { SplDailyProgress } from '@/types/spl/dailies';
import { SplPlayerDetails } from '@/types/spl/details';
import { Timer as TimerIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  playerDetails?: SplPlayerDetails;
  spspBalance?: number | undefined;
  dailyProgress?: {
    foundation?: SplDailyProgress;
    wild?: SplDailyProgress;
    modern?: SplDailyProgress;
  };
  dailyProgressLoading?: boolean;
  dailyProgressError?: string;
}

const maxEntriesPerDay = 15;

function getSpspEntries(spsp: number): number {
  const thresholds = [
    { min: 5_000_000, entries: 30 },
    { min: 2_500_000, entries: 25 },
    { min: 1_000_000, entries: 20 },
    { min: 500_000, entries: 16 },
    { min: 250_000, entries: 12 },
    { min: 100_000, entries: 8 },
    { min: 50_000, entries: 6 },
    { min: 25_000, entries: 4 },
    { min: 10_000, entries: 2 },
    { min: 2_500, entries: 1 },
  ];
  for (const { min, entries } of thresholds) {
    if (spsp >= min) return entries;
  }
  return 0;
}

const DailyProgressCard = ({
  title,
  progress,
  color,
  spsp,
}: {
  title: string;
  progress: SplDailyProgress;
  color: 'primary' | 'secondary' | 'success';
  spsp?: number;
}) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const endDate = new Date(progress.end_date);
  const timeRemaining = endDate.getTime() - currentTime;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <Card variant="outlined" sx={{ mb: 1, flex: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrophyIcon color={color} sx={{ mr: 1, fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight="bold">
            {title}
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Stack spacing={0}>
            <Typography variant="body2" color="text.secondary">
              Progress:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.total_wins} / {maxEntriesPerDay} wins
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(progress.total_wins / maxEntriesPerDay) * 100}
            color={color}
            sx={{
              height: 6,
              borderRadius: 3,
              flexGrow: 1,
              minWidth: 60,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '35px' }}>
            {Math.round((progress.total_wins / maxEntriesPerDay) * 100)}%
          </Typography>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {progress.rewards_ready_to_claim > 0 && (
            <Typography variant="body2" color="warning.main">
              Unclaimed: #{progress.rewards_ready_to_claim}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {hoursRemaining}h left
            </Typography>
          </Box>
        </Box>

        {/* Max Ranked Entries */}
        {progress.current_rewards?.max_ranked_entries && (
          <>
            <Box display="flex" sx={{ mt: 1 }} gap={1} alignItems="center">
              <Tooltip
                title={
                  <Box display="flex" flexDirection="column" gap={0}>
                    <Typography variant="caption">
                      Max Ranked Entries based on league:
                      {progress.current_rewards.max_ranked_entries}
                    </Typography>
                    <Typography variant="caption">
                      Max Ranked Entries based on staked SPS: {spsp ? getSpspEntries(spsp) : 0}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon fontSize="inherit" />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Max Entries:{' '}
                    {Math.min(
                      progress.current_rewards.max_ranked_entries,
                      spsp ? getSpspEntries(spsp) : 0
                    )}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function PlayerDailies({
  spspBalance,
  playerDetails,
  dailyProgress,
  dailyProgressLoading,
  dailyProgressError,
}: Props) {
  if (dailyProgressLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading daily progress...
        </Typography>
      </Box>
    );
  }

  if (dailyProgressError) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {dailyProgressError}
      </Alert>
    );
  }

  if (!dailyProgress) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No daily progress data available. Login to view daily quest progress.
      </Alert>
    );
  }

  const hasWildMatches = (playerDetails?.season_details?.wild?.battles ?? 0) > 0;
  const hasModernMatches = (playerDetails?.season_details?.modern?.battles ?? 0) > 0;
  const hasFrontierMatches = (playerDetails?.season_details?.foundation?.battles ?? 0) > 0;

  return (
    <Box width={'100%'}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrophyIcon color="primary" />
        Daily Progress
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
        {dailyProgress.foundation && hasFrontierMatches && (
          <DailyProgressCard
            title="Foundation"
            progress={dailyProgress.foundation}
            color="primary"
          />
        )}
        {dailyProgress.wild && hasWildMatches && (
          <DailyProgressCard
            title="Wild"
            progress={dailyProgress.wild}
            color="secondary"
            spsp={spspBalance}
          />
        )}

        {dailyProgress.modern && hasModernMatches && (
          <DailyProgressCard
            title="Modern"
            progress={dailyProgress.modern}
            color="success"
            spsp={spspBalance}
          />
        )}
      </Box>
    </Box>
  );
}
