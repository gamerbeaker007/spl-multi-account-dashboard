'use client';

import { WEB_URL } from '@/lib/staticsIconUrls';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  packs: { [edition: number]: number };
}

const packIconMap: { [key: string]: string } = {
  1: 'icon_pack_beta.png',
  7: 'img_pack_chaos-legion_200.png',
  8: 'img_pack_riftwatchers_opt.png',
  15: 'img_pack_foundations_250.png',
};

const editionNames: { [key: string]: string } = {
  1: 'Beta',
  7: 'Chaos Legion',
  8: 'Riftwatchers',
  15: 'Foundations',
};
const iconSize = 75;

const findPackIconUrl = (edition: string): string => {
  const editionName = packIconMap[edition];
  return `${WEB_URL}website/icons/${editionName}`;
};

export function Packs({ packs }: Props) {
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
