import { SplBalance } from '@/types/spl/balances';
import { Box } from '@mui/material';
import Glint from './Glint';
import Guild from './Guild';
import Potions from './Potions';
import Scrolls from './Scrolls';
import TopBalances from './TopBalances';

interface Props {
  balances: SplBalance[];
}

export default function PlayerBalances({ balances }: Props) {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
    >
      <TopBalances balances={balances} />

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Potions balances={balances} />
        <Scrolls balances={balances} />
        <Guild balances={balances} />
      </Box>
      <Glint balances={balances} />
    </Box>
  );
}
