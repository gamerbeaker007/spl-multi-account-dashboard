import { PlayerCardCollectionData } from '@/hooks/usePlayerCardCollection';
import { SplBalance } from '@/types/spl/balances';
import { Box } from '@mui/material';
import Glint from './Glint';
import Guild from './Guild';
import Potions from './Potions';
import Scrolls from './Scrolls';
import TopBalances from './TopBalances';
import CardCollection from './CardCollection';

interface Props {
  balances: SplBalance[];
  cardData?: PlayerCardCollectionData;
  cardDataLoading?: boolean;
  cardDataError?: string;
}

export default function PlayerBalances({
  balances,
  cardData,
  cardDataLoading,
  cardDataError,
}: Props) {
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
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Glint balances={balances} />
        <CardCollection
          cardData={cardData}
          cardDataLoading={cardDataLoading}
          cardDataError={cardDataError}
        />
      </Box>
    </Box>
  );
}
