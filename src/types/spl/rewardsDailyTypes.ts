
// Reuse from the earlier model where it makes sense
export type PotionKind = "legendary" | "gold" | string;

export interface QuestRewardsEnvelope {
  result: {
    success: boolean;
    rewards: QuestReward[];
  };
  cards: string[];      // e.g. []
  league: number;       // e.g. 8 or 13 in your examples
}

// ───────────────── Daily Quest / Daily Match reward union ─────────────────
// Examples observed: "pack" (with edition), "frontier_entries", "ranked_entries"
interface QuestRewardBase {
  type: string;
  quantity: number;
}

export interface QuestRewardPack extends QuestRewardBase {
  type: "pack";
  edition: number; // present on "pack"
}

export interface QuestRewardFrontierEntries extends QuestRewardBase {
  type: "frontier_entries";
}

export interface QuestRewardRankedEntries extends QuestRewardBase {
  type: "ranked_entries";
}

// Future-proof: unknown reward types
export interface QuestRewardUnknown extends QuestRewardBase {
  [k: string]: unknown;
}

export type QuestReward =
  | QuestRewardPack
  | QuestRewardFrontierEntries
  | QuestRewardRankedEntries
  | QuestRewardUnknown;

// ───────────────── Quest data ─────────────────
export interface QuestData {
  id: string;
  player: string;
  created_date: string;     // ISO timestamp
  created_block: number;
  name: string;             // e.g. "foundation", "wild"
  total_items: number;
  completed_items: number;
  reward_qty: number;
  claim_trx_id: string;
  claim_date: string;       // ISO timestamp
  /**
   * IMPORTANT:
   * In the *raw* payload this is a STRING that contains JSON.
   * After parsing, you likely want to hold the parsed object below:
   */
  rewards: string | QuestRewardsEnvelope;
}

export interface DailyQuestPayload {
  quest_data: QuestData;
  potions: null | Record<string, unknown>; // observed as null; keep open for future
}

// The outermost envelope you actually receive
export interface DailyQuestOuterEnvelope {
  result: string; // JSON string of DailyQuestPayload
}
