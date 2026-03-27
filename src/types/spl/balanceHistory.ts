// Balance history from /players/balance_history endpoint
// Tokens: DEC, SPS, MERITS, VOUCHER, CREDITS, GLINT
export interface SplBalanceHistoryItem {
  player: string;
  token: string;
  amount: string;
  balance_start: string;
  balance_end: string;
  block_num: number;
  trx_id: string;
  type: string;
  created_date: string;
  counterparty: string;
  last_update_date: string;
  is_archived: number;
}

// Unclaimed balance history from /players/unclaimed_balance_history endpoint
// Tokens: SPS, VOUCHER
export interface SplUnclaimedBalanceHistoryItem {
  reward_action: 'earned' | 'claimed';
  id: string;
  player: string;
  token: string;
  type: string; // e.g. 'wild', 'brawl', 'survival_bracket'
  amount: string;
  block_num: number;
  trx_id: string;
  created_date: string;
  to_player: string;
  status: string | null;
  last_block_action_date: string | null;
  action: string;
  block_successful: boolean;
  block_result: string;
}

export type BalanceHistoryTokenType = 'DEC' | 'SPS' | 'MERITS' | 'VOUCHER' | 'CREDITS' | 'GLINT';
export type UnclaimedTokenType = 'SPS' | 'VOUCHER';

// Aggregated summary per token
export interface TokenBalanceSummary {
  token: string;
  totalEarned: number;
  totalSpent: number;
  net: number;
  byType: Record<string, { earned: number; spent: number; count: number }>;
}

// Full balance history result for a season
export interface SeasonBalanceHistory {
  username: string;
  seasonId: number;
  dateRange: {
    start: string;
    end: string;
  };
  balanceHistory: TokenBalanceSummary[];
  unclaimedHistory: TokenBalanceSummary[];
}
