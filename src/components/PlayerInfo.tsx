import { avatar_icon_url, findLeagueLogoUrl } from '@/lib/statics_icon_urls';
import { SplFormat } from '@/types/spl/format';
import { SplLeaderboardPlayer } from '@/types/spl/leaderboard';
import { Avatar, Box, Typography } from '@mui/material';
import { AuthenticationStatus } from './AuthenticationStatus';

interface Props {
  username: string;
  leaderboards?: {
    foundation: SplLeaderboardPlayer | null;
    wild: SplLeaderboardPlayer | null;
    modern: SplLeaderboardPlayer | null;
  };
}

const avatarSize = 25;
const leagueLogoSize = 100;

function getHighestLeaderboard(leaderboards: Props['leaderboards']): {
  leaderboard: SplLeaderboardPlayer | null;
  format: SplFormat;
} | null {
  const leaderboardArray = [
    {
      leaderboard: leaderboards?.foundation || null,
      format: 'foundation' as const,
    },
    { leaderboard: leaderboards?.wild || null, format: 'wild' as const },
    { leaderboard: leaderboards?.modern || null, format: 'modern' as const },
  ];

  return leaderboardArray.reduce<{
    leaderboard: SplLeaderboardPlayer | null;
    format: SplFormat;
  } | null>((highest, current) => {
    return !highest ||
      (current.leaderboard &&
        current.leaderboard.rating > (highest.leaderboard?.rating || 0))
      ? current
      : highest;
  }, null);
}

export default function PlayerInfo({ username, leaderboards }: Props) {
  const result = getHighestLeaderboard(leaderboards);
  const leaderboard = result?.leaderboard || null;
  const format = result?.format || null;

  const avatarId = leaderboard?.avatar_id || 0;
  const avatarUrl = avatar_icon_url.replace('_0.png', `_${avatarId}.png`);

  const logoUrl = findLeagueLogoUrl(format, leaderboard?.league || 0);

  return (
    <Box
      sx={{
        display: 'flex ',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        mb: 1,
      }}
    >
      {/* Authentication Status */}
      <Box sx={{ mb: 1 }}>
        <AuthenticationStatus username={username} />
      </Box>

      <Box
        display={'flex'}
        flexDirection="row"
        justifyContent={'center'}
        alignItems="center"
        gap={1}
      >
        <Avatar
          src={avatarUrl}
          alt={username}
          sx={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
          }}
        />
        <Typography variant="h6">{username}</Typography>
      </Box>
      <Box display={'flex'} flexDirection="row">
        {logoUrl && (
          <Avatar
            src={logoUrl}
            alt={`${format} league logo`}
            sx={{
              width: leagueLogoSize,
              height: leagueLogoSize,
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {leaderboard
            ? `Rating: ${leaderboard.rating} | Rank: ${leaderboard.rank}`
            : 'No leaderboard data available'}
        </Typography>
      </Box>
    </Box>
  );
}
