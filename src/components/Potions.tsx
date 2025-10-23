import {
  gold_icon_url,
  legendary_icon_url,
  midnight_icon_url,
} from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Avatar, Box, Stack, Typography } from '@mui/material';

interface Props {
  balances: SplBalance[];
}

const iconSize = 20;

const MyPotion = ({
  iconUrl,
  title,
  value,
}: {
  iconUrl: string;
  title: string;
  value: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Avatar src={iconUrl} sx={{ width: iconSize, height: iconSize }}>
      {title.slice(0, 2)}
    </Avatar>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default function Potions({ balances }: Props) {
  // Extract balance values
  const gold = balances.find(b => b.token === 'GOLD')?.balance || 0;
  const legendary = balances.find(b => b.token === 'LEGENDARY')?.balance || 0;
  const midnight = balances.find(b => b.token === 'MIDNIGHTPOT')?.balance || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Potions
        </Typography>
        <MyPotion
          iconUrl={gold_icon_url}
          title="Gold"
          value={largeNumberFormat(gold)}
        />
        <MyPotion
          iconUrl={legendary_icon_url}
          title="Legendary"
          value={largeNumberFormat(legendary)}
        />
        <MyPotion
          iconUrl={midnight_icon_url}
          title="Midnight Potion"
          value={largeNumberFormat(midnight)}
        />
      </Stack>
    </Box>
  );
}
