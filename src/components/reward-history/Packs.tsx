'use client';

import { editionNames, findPackIconUrl } from '@/lib/utils';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  packs: { [edition: number]: number };
}

const iconSize = 75;

export function Packs({ packs }: Props) {
  const isEmpty = Object.keys(packs).length === 0;
  if (isEmpty) return null;
  return (
    <Box border={'1px solid'} borderRadius={2} p={2} width={'135px'}>
      <Typography variant="h6">Packs</Typography>
      {Object.entries(packs).length > 0 && (
        <Box>
          {Object.entries(packs).map(([edition, amount]) => (
            <Box key={edition} justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              {findPackIconUrl(edition) && (
                <Image
                  src={findPackIconUrl(edition)}
                  alt={editionNames[edition]}
                  width={iconSize}
                  height={iconSize}
                />
              )}
              <Typography variant="body2" color="textSecondary">
                {editionNames[edition]}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {amount}x
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
