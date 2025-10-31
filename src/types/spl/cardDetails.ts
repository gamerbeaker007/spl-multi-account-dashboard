export interface CardStats {
  mana: number[];
  attack: number[];
  ranged: number[];
  magic: number[];
  armor: number[];
  health: number[];
  speed: number[];
  abilities: string[][];
}

export interface CardDistribution {
  card_detail_id: number;
  gold: boolean;
  foil: number;
  edition: number;
  num_cards: string;
  unbound_cards: string;
  total_xp: string;
  num_burned: string;
  total_burned_xp: string;
}

export interface SplCardDetail {
  id: number;
  name: string;
  color: string;
  type: string;
  sub_type: string;
  rarity: number;
  drop_rate: number;
  stats: CardStats;
  is_starter: boolean;
  editions: string;
  total_printed: number;
  is_promo: boolean;
  stake_type_id: number;
  game_type: string;
  distribution: CardDistribution[];
  tier: number;
}
