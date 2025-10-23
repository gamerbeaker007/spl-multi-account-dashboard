import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

import { SplLeaderboardPlayer } from '@/types/spl/leaderboard';

interface Props {
  leaderboards: {
    wild: SplLeaderboardPlayer | null;
    foundation: SplLeaderboardPlayer | null;
    modern: SplLeaderboardPlayer | null;
  };
}

export default function Leaderboard({ leaderboards }: Props) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Leaderboard Rankings</Typography>
      <Grid container spacing={2}>
        {Object.entries(leaderboards).map(([format, leaderboard]) => (
          <Grid key={format} size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {format}
                </Typography>
                {leaderboard ? (
                  <Box>
                    <Typography variant="body2">
                      Season: #{leaderboard.season}
                    </Typography>
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
                      Record: {leaderboard.wins}/{leaderboard.battles}(
                      {((leaderboard.wins / leaderboard.battles) * 100).toFixed(
                        1
                      )}
                      %)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
