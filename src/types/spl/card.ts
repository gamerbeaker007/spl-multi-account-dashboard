export interface SplCardCollection {
  player: string;
  cards: SplPlayerCard[];
}
export interface SplPlayerCard {

  player: string;
  uid: string;
  card_detail_id: number;
  xp: number;
  gold: boolean;
  edition: number;
  card_set: string;
  collection_power: number;
  // market_id: string | null;
  // buy_price: number | null;
  // market_listing_type: string | null;
  // market_listing_status: string | null;
  // market_created_date: string | null;
  // rental_type: string | null;
  // rental_days: number | null;
  // rental_date: string | null;
  // next_rental_payment: string | null;
  // cancel_tx: string | null;
  // cancel_date: string | null;
  // cancel_player: string | null;
  // last_used_block: number | null;
  // last_used_player: string | null;
  // last_used_date: string | null;
  // last_transferred_block: number | null;
  // last_transferred_date: string | null;
  // alpha_xp: number;
  // delegated_to: string | null;
  // delegation_tx: string | null;
  // skin: string | null;
  // delegated_to_display_name: string | null;
  display_name: string;
  // lock_days: number;
  // unlock_date: string | null;
  // wagon_uid: string | null;
  // stake_ref_uid: string | null;
  // stake_start_date: string | null;
  // stake_end_date: string | null;
  // stake_plot: string | null;
  // stake_region: string | null;
  // created_date: string | null;
  // created_block: number | null;
  // created_tx: string | null;
  // expiration_date: string | null;
  // last_buy_price: number | null;
  // last_buy_currency: string | null;
  bcx: number;
  // land_base_pp: number;
  // land_dec_stake_needed: number;
  set_id: string;
  bcx_unbound: number;
  // renewal_tx: string | null;
  // renewal_date: string | null;
  // survival_date: string | null;
  // survival_mode_disabled: boolean;
  foil: number;
  mint: string | null;
  level: number;
};


export interface EnrichedCollectionCard extends SplPlayerCard {
  count: number;
}
