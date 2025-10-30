import { avatar_icon_url, findLeagueLogoUrl } from '@/lib/statics_icon_urls';
import { SplLeagueInfo as SplFormatInfo, SplPlayerDetails } from '@/types/spl/details';
import { SplFormat } from '@/types/spl/format';
import { Avatar, Box, Typography } from '@mui/material';
import { AuthenticationStatus } from './AuthenticationStatus';

interface Props {
  username: string;
  playerDetails?: SplPlayerDetails;
  onAuthChange?: () => void;
}

const avatarSize = 25;
const leagueLogoSize = 100;

function getHighestRatingFormat(playerDetails: SplPlayerDetails): {
  playerHighestFormatInfo: SplFormatInfo;
  format: SplFormat;
} | null {

  const highest = Object.entries(playerDetails.season_details).reduce<{
    formatInfo: SplFormatInfo;
    format: SplFormat;
  } | null>((max, [key, value]) => {
    if (!value) return max;
    const current = { formatInfo: value, format: key as SplFormat };
    return !max || current.formatInfo.rating > max.formatInfo.rating ? current : max;
  }, null);

  if (!highest) return null;

  return {
    playerHighestFormatInfo: highest.formatInfo,
    format: highest.format,
  };
}

export default function PlayerInfo({ username, playerDetails, onAuthChange }: Props) {
  const result = playerDetails ? getHighestRatingFormat(playerDetails) : null;
  const highestFormatDetails = result?.playerHighestFormatInfo || null;
  const format = result?.format || null;

  const avatarId = highestFormatDetails?.avatar_id || 0;
  const avatarUrl = avatar_icon_url.replace('_0.png', `_${avatarId}.png`);

  const logoUrl = findLeagueLogoUrl(format, highestFormatDetails?.league || 0);

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
        <AuthenticationStatus username={username} onAuthChange={onAuthChange} />
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
          {highestFormatDetails
            ? `Rating: ${highestFormatDetails.rating} | Rank: ${highestFormatDetails.rank}`
            : 'No leaderboard data available'}
        </Typography>
      </Box>
    </Box>
  );
}
