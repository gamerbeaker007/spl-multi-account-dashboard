// Base structure for all history entries
export interface ParsedHistory {
  id: string;
  block_id: string;
  prev_block_id: string;
  type: historyTypes;
  player: string;
  affected_player: string;
  data: ClaimLeagueRewardData | ClaimSeasonLeagueRewardData | ClaimDailyData | PurchaseData;
  success: boolean;
  error: string | null;
  block_num: number;
  created_date: string;
  result:
    | ClaimLeagueRewardResult
    | ClaimSeasonLeagueRewardResult
    | ClaimDailyResult
    | PurchaseResult;
  steem_price: number | null;
  sbd_price: number | null;
  is_owner: boolean;
}

export type historyTypes = 'claim_daily' | 'claim_reward' | 'purchase';
export type purchaseTypes =
  | 'reward_merits'
  | 'reward_draw'
  | 'ranked_draw_entry'
  | 'potion'
  | 'unbind_scroll';

export type rewardTypes =
  | 'reward_card'
  | 'merits'
  | 'common_scroll'
  | 'rare_scroll'
  | 'epic_scroll'
  | 'legendary_scroll'
  | 'potion'
  | 'ranked_entries'
  | 'unbind_scroll';

export type subTypes =
  | 'reward_merits'
  | 'common_draw'
  | 'rare_draw'
  | 'epic_draw'
  | 'legendary_draw'
  | 'minor_draw'
  | 'major_draw'
  | 'ultimate_draw'
  | 'ranked_draw_entry';

export interface ClaimSeasonLeagueRewardData {
  type: 'league_season';
  season: number;
  app: string;
  n: string;
}

export interface ClaimLeagueRewardData {
  type: 'league';
  tier: number;
  season: number;
  format: string;
  use_legendary_potions: boolean;
  use_gold_potions: boolean;
}

export interface ClaimDailyData {
  use_gold_potions: boolean;
  use_legendary_potions: boolean;
  format: string;
  app: string;
  n: string;
}

export interface UnbindScrollType {
  scroll_type: 'UNBIND_CA_C' | 'UNBIND_CA_R' | 'UNBIND_CA_E' | 'UNBIND_CA_L';
}

export const unbindScrollTypeMap: Record<string, string> = {
  UNBIND_CA_C: 'common_scroll',
  UNBIND_CA_R: 'rare_scroll',
  UNBIND_CA_E: 'epic_scroll',
  UNBIND_CA_L: 'legendary_scroll',
};

export interface PotionType {
  potion_type: 'GOLD' | 'LEGENDARY';
}

export interface PurchaseData {
  type: purchaseTypes;
  qty: number;
  currency: string;
  data?: RewardDrawData | UnbindScrollType | PotionType; // some have extra data like draws and packs
  use_gold_potions?: boolean;
  use_legendary_potions?: boolean;
  app: string;
  n: string;
}

export interface RankedDrawEntry {
  success: boolean;
  result: { player_entries: number; total_player_entries: number };
}

export interface RewardCardDetail {
  card_detail_id: number;
  xp: number;
  gold: boolean;
  foil: number;
  edition: number;
}

export interface RewardItemCard {
  type: 'reward_card';
  quantity: number;
  card: RewardCardDetail;
}

export interface RewardItemPotion {
  type: 'potion';
  potion_type: string;
  quantity: number;
}

export interface RewardItemMerits {
  type: 'merits';
  quantity: number;
}

export interface RewardItemScroll {
  type: 'common_scroll' | 'rare_scroll' | 'epic_scroll' | 'legendary_scroll';
  quantity: number;
}

export interface RewardRankedEntries {
  type: 'ranked_entries';
  quantity: number;
}

export interface RewardItemFrontierEntries {
  type: 'frontier_entries';
  quantity: number;
}

export interface RewardItemEnergy {
  type: 'energy';
  quantity: number;
}

export interface RewardItemPack {
  type: 'pack';
  edition: number;
  quantity: number;
}

export type RewardItems =
  | RewardItemCard
  | RewardItemPotion
  | RewardItemMerits
  | RewardItemScroll
  | RewardRankedEntries
  | RewardItemFrontierEntries
  | RewardItemEnergy
  | RewardItemPack;

export interface RewardDrawData {
  chest_type:
    | 'common_draw'
    | 'rare_draw'
    | 'epic_draw'
    | 'legendary_draw'
    | 'minor_draw'
    | 'major_draw'
    | 'ultimate_draw';
}

export interface RewardDraw {
  result: {
    success: boolean;
    rewards: RewardItems[];
    chest_tier: number;
    potions: PotionUsed;
  };
  cards: string[];
}

export interface RewardMerits {
  success: boolean;
  amount: number;
  token: string;
  type: string;
  created_date: string;
}

export interface PotionUsed {
  legendary: {
    charges_used: number;
  };
  gold: {
    charges_used: number;
  };
}

export interface UnbindScrollData {
  type: 'unbind_scroll';
  qty: number;
  currency: string;
  data: UnbindScrollType;
}

export interface PurchaseResult {
  id: string;
  trx_id: string;
  player: string;
  created_date: string;
  type: purchaseTypes;
  sub_type?: subTypes;
  payment_amount: string;
  payment_currency: string;
  quantity: number;
  amount_usd: number;
  bonus_quantity: number;
  season: number;
  data: RankedDrawEntry | RewardMerits | RewardDraw | UnbindScrollData | PotionType;
}

export interface ClaimLeagueRewardResult {
  success: boolean;
  rewards: {
    minor: RewardDraw;
    major: RewardDraw;
    ultimate: RewardDraw;
    minor_draw: number;
    major_draw: number;
    ultimate_draw: number;
  };
  type: string;
}

export interface ClaimSeasonLeagueRewardResult {
  success: boolean;
  rewards: number;
  affiliate_rewards: number;
  rating: number;
}

export interface ClaimDailyResultReward {
  result: {
    success: true;
    rewards: RewardItems[];
  };
  cards: string[]; //list of uuids
  league: number;
}

export interface ClaimDailyResult {
  quest_data: {
    id: string;
    player: string;
    created_date: string;
    created_block: number;
    name: string;
    total_items: number;
    completed_items: number;
    reward_qty: number;
    claim_trx_id: string;
    claim_date: string;
    rewards: ClaimDailyResultReward;
  };
  potions: PotionUsed;
}

export interface ParsedPlayerRewardHistory {
  allEntries: ParsedHistory[]; // All entries combined and sorted by date descending
  aggregation: RewardSummary; // Aggregated sum of all three categories
  totalEntries: number;
  seasonId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface RewardSummary {
  totalPacks: { [edition: number]: number };
  totalFrontierEntries: number;
  totalRankedEntries: number;
  totalCards: {
    [cardId: number]: { edition: number; quantity: number; gold: number; regular: number };
  };
  totalPotions: { [potionType: string]: number };
  totalPotionsUsed: { [potionType: string]: number };
  totalMerits: number;
  totalEnergy: number;
  totalScrolls: { [scrollType: string]: number };
  totalDraws: { minor: number; major: number; ultimate: number };
  totalShopDraws: { minor: number; major: number; ultimate: number };
  totalRarityDraws: { common: number; rare: number; epic: number; legendary: number };
  leagueAdvancements: { foundation: number[]; wild: number[]; modern: number[] };
  questTypeBreakdown: { [questType: string]: number };
}
