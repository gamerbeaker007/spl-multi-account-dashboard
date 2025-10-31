'use client';

import { foundation_entries_icon_url, ranked_entries_icon_url } from '@/lib/staticsIconUrls';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  totalFrontierEntries: number;
  totalRankedEntries: number;
}
const iconSize = 75;

export function Entries({ totalFrontierEntries, totalRankedEntries }: Props) {
  const isEmpty = totalFrontierEntries === 0 && totalRankedEntries === 0;
  if (isEmpty) return null;

  return (
    <Box border={'1px solid'} borderRadius={2} p={2} width={'220px'}>
      <Typography variant="h6">Fortune Draw Entries</Typography>
      {totalFrontierEntries > 0 && (
        <Box>
          <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
            <Image
              src={foundation_entries_icon_url}
              alt={'Frontier Entries'}
              width={iconSize}
              height={iconSize}
            />
            <Typography variant="body2" color="textSecondary">
              {totalFrontierEntries}x
            </Typography>
          </Box>
        </Box>
      )}
      {totalRankedEntries > 0 && (
        <Box>
          <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
            <Image
              src={ranked_entries_icon_url}
              alt={'Ranked Entries'}
              width={iconSize}
              height={iconSize}
            />
            <Typography variant="body2" color="textSecondary">
              {totalRankedEntries}x
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
