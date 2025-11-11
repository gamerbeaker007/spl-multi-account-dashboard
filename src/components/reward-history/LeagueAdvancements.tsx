import { findLeagueLogoUrl } from '@/lib/staticsIconUrls';
import { leagueNames } from '@/lib/utils';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  leagueAdvancements: { foundation: number[]; wild: number[]; modern: number[] };
}

const iconSize = 75;

export function LeagueAdvancements({ leagueAdvancements }: Props) {
  const isEmpty = !(['foundation', 'wild', 'modern'] as const).some(
    format => leagueAdvancements[format]?.length
  );
  if (isEmpty) return null;

  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      {(['foundation', 'wild', 'modern'] as const).map(format => {
        if (!leagueAdvancements[format]?.length) return null;
        const advancements = leagueAdvancements[format];
        const sortedAdvancements = advancements.sort((a, b) => a - b);

        return (
          <Box key={format}>
            <Typography style={{ textTransform: 'capitalize' }}>
              {format} League Advancements
            </Typography>
            {sortedAdvancements.map(advancement => {
              const logoUrl = findLeagueLogoUrl(format, advancement);
              return (
                <Box
                  key={advancement}
                  justifyItems={'center'}
                  sx={{ display: 'inline-block', m: 1 }}
                >
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt={`${format} league logo`}
                      width={iconSize}
                      height={iconSize}
                    />
                  )}
                  <Typography variant="body2" color="textSecondary">
                    {leagueNames[advancement]}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}
