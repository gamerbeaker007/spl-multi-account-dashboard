'use client';

import { useUsernameContext } from '@/contexts/UsernameContext';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
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
  username: string;
  playerDetails?: SplPlayerDetails;
  balances?: SplBalance[];
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
  balances,
}: {
  title: string;
  progress: SplDailyProgress;
  color: 'primary' | 'secondary' | 'success';
  balances?: SplBalance[];
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

  const spspIn = balances
    ? (Object.values(balances).find(balance => balance.token === 'SPSP-IN')?.balance ?? 0)
    : 0;
  const spspOut = balances
    ? (Object.values(balances).find(balance => balance.token === 'SPSP-OUT')?.balance ?? 0)
    : 0;
  const spsp = balances
    ? (Object.values(balances).find(balance => balance.token === 'SPSP')?.balance ?? 0)
    : 0;

  const totalSPSP = spsp + spspIn - spspOut;

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
                    <Typography variant="caption">
                      Total SPS: {largeNumberFormat(totalSPSP)}
                    </Typography>
                    <Typography variant="caption">SPSP: {largeNumberFormat(spsp)}</Typography>
                    <Typography variant="caption">SPSP In: {largeNumberFormat(spspIn)}</Typography>
                    <Typography variant="caption">
                      SPSP Out: {largeNumberFormat(spspOut)}
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

export default function PlayerDailies({ username, balances, playerDetails }: Props) {
  const { data, loading, fetchDailyProgress } = useDailyProgress(username);
  const { refreshTrigger } = useUsernameContext();

  // Refetch when refresh button is clicked
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchDailyProgress();
    }
  }, [refreshTrigger, fetchDailyProgress]);

  const hasWildMatches = (playerDetails?.season_details?.wild?.battles ?? 0) > 0;
  const hasModernMatches = (playerDetails?.season_details?.modern?.battles ?? 0) > 0;
  const hasFrontierMatches = (playerDetails?.season_details?.foundation?.battles ?? 0) > 0;

  return (
    <Box width={'100%'} height={260}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon color="primary" />
            Daily Progress
          </Typography>
          {loading && <CircularProgress size={12} sx={{ ml: 0.5 }} />}
        </Box>
      </Box>

      {!data ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No daily progress data available. Login to view daily quest progress.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
          {data?.format?.foundation && hasFrontierMatches && (
            <DailyProgressCard
              title="Foundation"
              progress={data.format.foundation}
              color="primary"
            />
          )}
          {data?.format?.wild && hasWildMatches && (
            <DailyProgressCard
              title="Wild"
              progress={data.format.wild}
              color="secondary"
              balances={balances}
            />
          )}

          {data?.format?.modern && hasModernMatches && (
            <DailyProgressCard
              title="Modern"
              progress={data.format.modern}
              color="success"
              balances={balances}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
