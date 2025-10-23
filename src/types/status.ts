import { SplBalance } from './spl/balances';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from './spl/draws';
import { SplLeaderboardPlayer } from './spl/leaderboard';

export type statusResponse = {
  username: string;
  balances: SplBalance[];
  draws: {
    frontier: SplFrontierDrawStatus;
    ranked: SplRankedDrawStatus;
  };
  leaderboards: {
    wild: SplLeaderboardPlayer | null;
    foundation: SplLeaderboardPlayer | null;
    modern: SplLeaderboardPlayer | null;
  };
};
