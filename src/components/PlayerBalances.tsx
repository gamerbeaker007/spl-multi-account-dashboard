import { PlayerCardCollectionData } from '@/types/playerCardCollection';
import { SplBalance } from '@/types/spl/balances';
import { Box } from '@mui/material';
import CardCollection from './CardCollection';
import Glint from './Glint';
import Guild from './Guild';
import Potions from './Potions';
import Scrolls from './Scrolls';
import TopBalances from './TopBalances';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';

interface Props {
  username: string;
  balances?: SplBalance[];
  seasonRewards?: SPLSeasonRewards;
  collectionData?: PlayerCardCollectionData | null;
  collectionLoading?: boolean;
}

export default function PlayerBalances({
  username,
  balances,
  seasonRewards,
  collectionData,
  collectionLoading,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
      <TopBalances balances={balances} />

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Potions balances={balances} />
        <Scrolls balances={balances} />
        <Guild balances={balances} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Glint balances={balances} seasonRewards={seasonRewards} />
        <CardCollection
          username={username}
          externalData={collectionData}
          externalLoading={collectionLoading}
        />
      </Box>
    </Box>
  );
}
