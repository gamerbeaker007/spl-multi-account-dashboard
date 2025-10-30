// Typed reward interfaces after parsing from API
export interface ParsedReward {
  type: string;
  quantity: number;
  edition?: number;
  potion_type?: string;
  card?: {
    card_detail_id: number;
    edition: number;
    gold: boolean;
  };
  minor_draw?: number;
  minor?: {
    result: { rewards: ParsedReward[] };
  };
  major_draw?: number;
  major: {
    result: { rewards: ParsedReward[] };
  };
  ultimate_draw?: number;
  ultimate?: {
    result: { rewards: ParsedReward[] };
  };
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

export interface ParsedPlayerRewardHistory {
  entries: ParsedHistoryEntry[];
  totalEntries: number;
  seasonId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}
