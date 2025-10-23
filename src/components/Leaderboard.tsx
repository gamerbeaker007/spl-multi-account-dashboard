import { Box, Card, Typography } from '@mui/material';

import { SplLeaderboardPlayer } from '@/types/spl/leaderboard';

interface Props {
  leaderboards: {
    foundation: SplLeaderboardPlayer | null;
    wild: SplLeaderboardPlayer | null;
    modern: SplLeaderboardPlayer | null;
  };
}

export default function Leaderboard({ leaderboards }: Props) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">
        Leaderboard Rankings #{leaderboards.wild?.season}
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}
      >
        {(['foundation', 'modern', 'wild'] as const).map(format => {
          const leaderboard = leaderboards[format];
          return (
            <Card key={format} variant="outlined" sx={{ flex: 1, p: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ textTransform: 'capitalize' }}
              >
                {format}
              </Typography>
              {leaderboard ? (
                <Box>
                  <Typography variant="body2">
                    Rank: #{leaderboard.rank}
                  </Typography>
                  <Typography variant="body2">
                    Rating: {leaderboard.rating}
                  </Typography>
                  <Typography variant="body2">
                    League: {leaderboard.league}
                  </Typography>
                  <Typography variant="body2">
                    Battles: {leaderboard.wins}/{leaderboard.battles}
                  </Typography>
                  <Typography variant="body2">
                    Ratio:{' '}
                    {((leaderboard.wins / leaderboard.battles) * 100).toFixed(
                      1
                    )}
                    %
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              )}
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
