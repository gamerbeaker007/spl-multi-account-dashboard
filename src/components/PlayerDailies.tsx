import { SplDailyProgress } from '@/types/spl/dailies';
import { SplLeaderboardPlayer } from '@/types/spl/leaderboard';
import {
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  leaderboards?: {
    foundation?: SplLeaderboardPlayer | null;
    wild?: SplLeaderboardPlayer | null;
    modern?: SplLeaderboardPlayer | null;
  };
  dailyProgress?: {
    foundation?: SplDailyProgress;
    wild?: SplDailyProgress;
    modern?: SplDailyProgress;
  };
  dailyProgressLoading?: boolean;
  dailyProgressError?: string;
}

const maxEntriesPerDay = 15;

const DailyProgressCard = ({
  title,
  progress,
  color,
}: {
  title: string;
  progress: SplDailyProgress;
  color: 'primary' | 'secondary' | 'success';
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
  const hoursRemaining = Math.max(
    0,
    Math.floor(timeRemaining / (1000 * 60 * 60))
  );

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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: '35px' }}
          >
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Max Ranked Entries: {progress.current_rewards.max_ranked_entries}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default function PlayerDailies({
  leaderboards,
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
      <Alert severity="error" sx={{ mb: 2 }}>
        Daily Progress Error: {dailyProgressError}
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

  const hasWildMatches = (leaderboards?.wild?.battles ?? 0) > 0;
  const hasModernMatches = (leaderboards?.modern?.battles ?? 0) > 0;
  const hasFrontierMatches = (leaderboards?.foundation?.battles ?? 0) > 0;

  return (
    <Box width={'100%'}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <TrophyIcon color="primary" />
        Daily Progress
      </Typography>

      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}
      >
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
          />
        )}

        {dailyProgress.modern && hasModernMatches && (
          <DailyProgressCard
            title="Modern"
            progress={dailyProgress.modern}
            color="success"
          />
        )}
      </Box>
    </Box>
  );
}
