export interface PotionsUsed {
  legendary: {
    charges_used: number;
  };
  gold: {
    charges_used: number;
  };
}

export interface RewardEntry {
  type: string;
  sub_type?: string;
  quantity: number;
  edition?: number;
  potion_type?: string;
  rewards?: number;
  affiliate_rewards?: number;
  card?: {
    card_detail_id: number;
    edition: number;
    gold: boolean;
  };
}

export interface ChestEntry {
  result: {
    rewards: RewardEntry[];
    potions?: PotionsUsed;
  };
}

// Typed reward interfaces after parsing from API
export interface ParsedReward extends RewardEntry {
  minor_draw?: number;
  major_draw?: number;
  ultimate_draw?: number;
  minor?: ChestEntry;
  major?: ChestEntry;
  ultimate?: ChestEntry;
}

export interface ParsedData {
  type?: string;
  season?: number;
  format?: string;
  tier?: number;
  rewards?: number; // For league_season: total glint claimed
  affiliate_rewards?: number; // For league_season: affiliate rewards glint
}

export interface ParsedHistoryEntry {
  type: 'claim_daily' | 'claim_reward' | string;
  blockNum?: number; // Optional for purchases
  createdDate: string;
  questName?: string; // For daily quests
  rewards: ParsedReward[] | ParsedReward;
  metaData?: ParsedData;
  success: boolean;
  hasParsingError?: boolean;
  rawData?: string; // Fallback for unparseable data
}

// Purchase-specific entry
export interface ParsedPurchaseEntry {
  type: 'purchase' | string; // Purchase type (e.g., 'purchase')
  buyType: string; // Purchase type (e.g., 'wild_pass', 'conclave_pack_standard', 'reward_draw')
  subType?: string; // Purchase sub-type (e.g., 'common_draw', 'minor_draw')
  createdDate: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  quantity?: number;
  bonusQuantity?: number;
  amountUsd?: number;
  season?: number;
  rewards?: ParsedReward[]; // Rewards from draw purchases
  potions?: PotionsUsed;
  success: boolean;
  hasParsingError?: boolean;
  rawData?: string;
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

export interface ParsedPlayerRewardHistory {
  dailyEntries: ParsedHistoryEntry[]; // claim_daily entries
  leagueEntries: ParsedHistoryEntry[]; // claim_reward entries
  purchaseEntries: ParsedPurchaseEntry[]; // purchase entries
  aggregation: RewardSummary; // Aggregated sum of all three categories
  totalEntries: number;
  seasonId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}
