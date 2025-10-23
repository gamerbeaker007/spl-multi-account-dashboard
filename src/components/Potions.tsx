import {
  gold_icon_url,
  legendary_icon_url,
  midnight_icon_url,
} from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Avatar, Box, Stack, Tooltip, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';

interface Props {
  balances: SplBalance[];
}

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
        <BalanceItem
          iconUrl={gold_icon_url}
          title="Gold"
          value={largeNumberFormat(gold)}
        />
        <BalanceItem
          iconUrl={legendary_icon_url}
          title="Legendary"
          value={largeNumberFormat(legendary)}
        />
        <BalanceItem
          iconUrl={midnight_icon_url}
          title="Midnight Potion"
          value={largeNumberFormat(midnight)}
        />
      </Stack>
    </Box>
  );
}
