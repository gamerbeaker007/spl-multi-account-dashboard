// Purchase-specific type definitions for Splinterlands purchases

export interface SplPurchase {
  id: string;
  trx_id?: string; // Optional, for blockchain transactions
  purchaser?: string; // Optional, for some purchase types
  player: string;
  created_date: string;
  type: string; // e.g., 'wild_pass', 'conclave_pack_standard', 'reward_draw', 'reward_merits', 'ranked_draw_entry'
  sub_type?: string; // e.g., 'common_draw', 'minor_draw', 'major_draw', 'ultimate_draw', 'legendary_draw'
  payment_amount: string;
  payment_currency: string; // e.g., 'DEC', 'GLINT', 'CREDITS'
  quantity: number;
  bonus_quantity: number;
  amount_usd?: string; // Optional, for some purchase types
  season?: number; // Optional, season-specific purchases
  data: string | null; // JSON string with purchase details
  wagons_earned?: number; // Optional, for some purchase types
}

// Draw types that contain rewards
export type DrawPurchaseType = 'reward_draw' | 'frontier_draw' | 'ranked_draw';

// Pack purchases
export type PackPurchaseType =
  | 'conclave_pack_standard'
  | 'conclave_pack_ultimate'
  | 'chaos_pack'
  | 'rift_pack';

// Pass/subscription purchases
export type PassPurchaseType = 'wild_pass' | 'modern_pass' | 'season_pass';

// Resource purchases
export type ResourcePurchaseType =
  | 'reward_merits'
  | 'ranked_draw_entry'
  | 'frontier_draw_entry'
  | 'energy';

export type PurchaseType =
  | DrawPurchaseType
  | PackPurchaseType
  | PassPurchaseType
  | ResourcePurchaseType;

// Draw sub-types
export type DrawSubType =
  | 'common_draw'
  | 'minor_draw'
  | 'major_draw'
  | 'ultimate_draw'
  | 'legendary_draw';

// Parsed purchase data structures
export interface PurchaseDrawData {
  result: {
    success: boolean;
    rewards: Array<{
      type: string;
      quantity: number;
      card?: {
        card_detail_id: number;
        xp: number;
        gold: boolean;
        foil: number;
        edition: number;
      };
      potion_type?: string;
    }>;
    chest_tier?: number;
    potions?: {
      legendary?: {
        potion_type: string;
        charges: number;
        charges_used: number;
        charges_remaining: number;
        potions_used: number;
      } | null;
      gold?: {
        potion_type: string;
        charges: number;
        charges_used: number;
        charges_remaining: number;
        potions_used: number;
      } | null;
    };
  };
  cards?: string[]; // Card IDs
}

export interface PurchaseMeritsData {
  success: boolean;
  from: string;
  to: string;
  amount: number;
  token: string;
  from_start_balance: number;
  from_end_balance: number;
  to_start_balance: number;
  to_end_balance: number;
  block_num: number;
  trx_id: string;
  type: string;
  created_date: string;
}

export interface PurchaseDrawEntryData {
  success: boolean;
  result: {
    player_entries: number;
    total_player_entries: number;
  };
}

export interface PurchasePackData {
  type: string;
  qty: number;
  currency: string;
  data: {
    pack_type: string;
  };
  app: string;
  n: string;
  bonus: number;
  discount_vouchers: number;
  amount_discount: number;
}
