import { PlayerCardCollectionData } from '@/types/playerCardCollection';
import { SplBalance } from '@/types/spl/balances';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import { Box } from '@mui/material';
import CardCollection from './CardCollection';
import Glint from './Glint';
import Guild from './Guild';
import Potions from './Potions';
import Scrolls from './Scrolls';
import TopBalances from './TopBalances';

interface Props {
  username: string;
  balances?: SplBalance[];
  seasonRewards?: SPLSeasonRewards;
  glintLoading?: boolean;
  glintError?: string | null;
  collectionData?: PlayerCardCollectionData | null;
  collectionLoading?: boolean;
}

export default function PlayerBalances({
  username,
  balances,
  seasonRewards,
  glintLoading,
  glintError,
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
        <Glint
          balances={balances}
          seasonRewards={seasonRewards}
          glintLoading={glintLoading}
          glintError={glintError}
        />
        <CardCollection
          username={username}
          externalData={collectionData}
          externalLoading={collectionLoading}
        />
      </Box>
    </Box>
  );
}
