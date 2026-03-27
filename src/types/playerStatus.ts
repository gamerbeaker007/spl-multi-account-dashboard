import { SplBalance } from '@/types/spl/balances';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';

export interface PlayerStatusData {
  username: string;
  timestamp: string;
  balances?: SplBalance[];
  balancesError?: string;
  draws?: {
    frontier: SplFrontierDrawStatus;
    ranked: SplRankedDrawStatus;
  };
  drawsError?: string;
  playerDetails?: SplPlayerDetails;
  brawlDetails?: SplBrawlDetails;
  detailsError?: string;
  seasonRewards?: SPLSeasonRewards;
  seasonRewardsError?: string;
  error?: string;
}
