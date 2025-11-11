import {
  reward_draw_major_icon_url,
  reward_draw_minor_icon_url,
  reward_draw_ultimate_icon_url,
} from '@/lib/staticsIconUrls';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  totalDraws: { minor: number; major: number; ultimate: number };
}

const chestIconMap: { [key: string]: string } = {
  minor: reward_draw_minor_icon_url,
  major: reward_draw_major_icon_url,
  ultimate: reward_draw_ultimate_icon_url,
};

const iconSize = 75;

export function Chests({ totalDraws }: Props) {
  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      <Typography variant="h6">Chests</Typography>
      {Object.entries(totalDraws).length > 0 && (
        <Box>
          {Object.entries(totalDraws).map(([type, amount]) => (
            <Box key={type} justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              {chestIconMap[type] && (
                <Image src={chestIconMap[type]} alt={type} width={iconSize} height={iconSize} />
              )}
              <Typography variant="body2" color="textSecondary">
                {type}
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
