// ───────────────── Reusable base types ─────────────────
export type PotionKind = 'legendary' | 'gold' | string;

export interface CardStub {
  card_detail_id: number;
  xp: number;
  gold: boolean;
  foil: number; // 0 = regular, 1 = gold (if you also use 'gold' boolean, keep both for fidelity)
  edition: number;
}

export interface PotionUsage {
  potion_type: PotionKind;
  charges: number;
  charges_used: number;
  charges_remaining: number;
  potions_used: number;
}

// ───────────────── Rewards (discriminated union by "type") ─────────────────
interface RewardBase {
  type: string;
  quantity: number;
}

export interface RewardCard extends RewardBase {
  type: 'reward_card';
  card: CardStub;
}

export interface RewardPotion extends RewardBase {
  type: 'potion';
  potion_type: PotionKind;
}

export interface RewardMerits extends RewardBase {
  type: 'merits';
}

export interface RewardEnergy extends RewardBase {
  type: 'energy';
}

export interface RewardRankedEntries extends RewardBase {
  type: 'ranked_entries';
}

export interface RewardEpicScroll extends RewardBase {
  type: 'epic_scroll';
}

// Future-proof catch-all for unknown/new reward kinds
export interface RewardUnknown extends RewardBase {
  // Any new "type" not listed above will be parsed here
  // You still keep quantity, and you can carry extra fields if you want:
  [k: string]: unknown;
}

export type Reward =
  | RewardCard
  | RewardPotion
  | RewardMerits
  | RewardEnergy
  | RewardRankedEntries
  | RewardEpicScroll
  | RewardUnknown;

// ───────────────── Chest results per tier ─────────────────
export interface ChestResult {
  success: boolean;
  rewards: Reward[];
  chest_tier: number;
  potions: {
    legendary?: PotionUsage;
    gold?: PotionUsage;
    // leave room for more potion kinds if they ever appear
    [k: string]: PotionUsage | undefined;
  };
}

export interface TierPayout {
  result: ChestResult;
  cards: string[]; // e.g. "C18-885-XXXX..."
}

// ───────────────── Full parsed "result" payload ─────────────────
// Your example contains: success + rewards by tier + draw counts + top-level type ("league")
export interface ClaimRewardPayload {
  success: true;
  rewards: {
    minor: TierPayout;
    major: TierPayout;
    ultimate: TierPayout;
    minor_draw: number;
    major_draw: number;
    ultimate_draw: number;
  };
  type: 'league' | 'season' | string;
}

// If your outer object has { result: "<escaped JSON string>" }
export interface OuterEnvelope {
  result: string; // JSON string of ClaimRewardPayload
}
