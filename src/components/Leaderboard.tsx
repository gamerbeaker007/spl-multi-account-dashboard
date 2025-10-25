import { Avatar, Box, Card, Typography } from '@mui/material';

import { findLeagueLogoUrl } from '@/lib/statics_icon_urls';
import { SplFormat } from '@/types/spl/format';
import { SplLeaderboardPlayer } from '@/types/spl/leaderboard';

interface Props {
  leaderboards: {
    foundation: SplLeaderboardPlayer | null;
    wild: SplLeaderboardPlayer | null;
    modern: SplLeaderboardPlayer | null;
  };
}

const leagueLogoSize = 64;

export default function Leaderboard({ leaderboards }: Props) {
  const leaderboardsArray = (
    Object.entries(leaderboards) as [SplFormat, SplLeaderboardPlayer | null][]
  ).sort((a, b) => {
    // Sort by rating descending
    const ratingA = a[1]?.rating || 0;
    const ratingB = b[1]?.rating || 0;
    return ratingB - ratingA;
  });

  const firstValidSeason = leaderboardsArray.find(
    ([, leaderboard]) => leaderboard?.season
  )?.[1]?.season;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Leaderboard Rankings</Typography>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Season #{firstValidSeason}
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}
      >
        {leaderboardsArray.map(([format, leaderboard]) => {
          if ((leaderboard?.battles ?? 0) <= 0) return null;

          const logoUrl = findLeagueLogoUrl(format, leaderboard?.league);

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
                  {logoUrl && (
                    <Avatar
                      src={logoUrl}
                      alt={`${format} league logo`}
                      sx={{ width: leagueLogoSize, height: leagueLogoSize }}
                    />
                  )}
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
