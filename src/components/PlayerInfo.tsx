import { avatar_icon_url } from '@/lib/staticsIconUrls';
import { findLeagueLogoUrl } from '@/lib/utils';
import { SplLeagueInfo as SplFormatInfo, SplPlayerDetails } from '@/types/spl/details';
import { SplFormat } from '@/types/spl/format';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Avatar, Box, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import { AuthenticationStatus } from './AuthenticationStatus';

interface Props {
  username: string;
  playerDetails?: SplPlayerDetails;
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

function getNullRatingInfo(battles: number = 0): React.ReactNode {
  const battlesNeeded = 100 - battles;
  return (
    <Box
      component="span"
      display="flex"
      alignItems="center"
      gap={1}
      ml={1}
      sx={{ color: 'error.main' }}
    >
      Rank: Need {battlesNeeded} More Battles
    </Box>
  );
}

export default function PlayerInfo({ username, playerDetails }: Props) {
  const result = playerDetails ? getHighestRatingFormat(playerDetails) : null;
  const highestFormatDetails = result?.playerHighestFormatInfo || null;
  const format = result?.format || null;

  const avatarId = highestFormatDetails?.avatar_id || 0;
  const avatarUrl = avatar_icon_url.replace('_0.png', `_${avatarId}.png`);

  const logoUrl = findLeagueLogoUrl(format, highestFormatDetails?.league || 0);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex ',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
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
          {highestFormatDetails ? (
            highestFormatDetails.rank != null ? (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', color: 'success.main' }}
              >
                Rating: {highestFormatDetails.rating} | Rank: {highestFormatDetails.rank}
              </Box>
            ) : (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', color: 'success.main' }}
              >
                Rating: {highestFormatDetails.rating} |{' '}
                {getNullRatingInfo(highestFormatDetails.battles)}
              </Box>
            )
          ) : (
            'No leaderboard data available'
          )}
        </Typography>
      </Box>

      {/* Dashboard Link Icon */}
      <IconButton
        component={Link}
        href={`/dashboard?users=${encodeURIComponent(username)}`}
        size="small"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        aria-label="View dashboard"
      >
        <DashboardIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
