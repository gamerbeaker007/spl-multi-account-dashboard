import { SplBalance } from '@/types/spl/balances';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SplPlayerDetails } from '@/types/spl/details';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import { SplBrawlDetails } from '@/types/spl/brawl';

export interface PlayerStatusData {
  username: string;
  timestamp: string;
  balances?: SplBalance[];
  draws?: {
    frontier: SplFrontierDrawStatus;
    ranked: SplRankedDrawStatus;
  };
  playerDetails?: SplPlayerDetails;
  seasonRewards?: SPLSeasonRewards;
  brawlDetails?: SplBrawlDetails;
  error?: string;
}
