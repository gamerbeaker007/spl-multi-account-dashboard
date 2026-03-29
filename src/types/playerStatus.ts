import { SplBalance } from '@/types/spl/balances';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';

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
  error?: string;
}
