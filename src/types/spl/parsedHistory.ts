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
  quantity: number;
  edition?: number;
  potion_type?: string;
  card?: {
    card_detail_id: number;
    edition: number;
    gold: boolean;
  };
}

export interface ChestEntry {
  result: {
    rewards: RewardEntry[]
    potions?: PotionsUsed
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
  season?: number;
  format?: string;
  tier?: number;
}

export interface ParsedHistoryEntry {
  id: string;
  type: 'claim_daily' | 'claim_reward' | string;
  blockNum: number;
  createdDate: string;
  questName?: string; // For daily quests
  rewards: ParsedReward[] | ParsedReward;
  metaData?: ParsedData;
  success: boolean;
  hasParsingError?: boolean;
  rawData?: string; // Fallback for unparseable data
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
  leagueAdvancements: { foundation: number[]; wild: number[]; modern: number[] };
  questTypeBreakdown: { [questType: string]: number };
}

export interface ParsedPlayerRewardHistory {
  entries: ParsedHistoryEntry[];
  aggregation: RewardSummary;
  totalEntries: number;
  seasonId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}
