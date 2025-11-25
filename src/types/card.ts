import {
  archon_filter_icon_url,
  card_rarity_common_icon_url,
  card_rarity_epic_icon_url,
  card_rarity_legendary_icon_url,
  card_rarity_rare_icon_url,
  death_element_icon_url,
  dragon_element_icon_url,
  earth_element_icon_url,
  edition_alpha_icon_url,
  edition_beta_icon_url,
  edition_chaos_icon_url,
  edition_conclave_arcana_icon_url,
  edition_conclave_extra_icon_url,
  edition_conclave_rewards_icon_url,
  edition_foundation_icon_url,
  edition_gladius_icon_url,
  edition_promo_icon_url,
  edition_rebellion_icon_url,
  edition_reward_icon_url,
  edition_rift_icon_url,
  edition_soulbound_icon_url,
  edition_soulbound_rebellion_icon_url,
  edition_soulkeep_icon_url,
  edition_untamed_icon_url,
  fire_element_icon_url,
  life_element_icon_url,
  neutral_element_icon_url,
  unit_filter_icon_url,
  water_element_icon_url,
} from '@/lib/staticsIconUrls';

export interface EidtionTypeDef {
  displayName: string;
  urlName: string;
  setName?: string;
  setIcon?: string;
}

export const editionMap: Record<number, EidtionTypeDef> = {
  0: {
    displayName: 'Alpha',
    urlName: 'alpha',
    setName: 'alpha',
    setIcon: edition_alpha_icon_url,
  },
  1: {
    displayName: 'Beta',
    urlName: 'beta',
    setName: 'beta',
    setIcon: edition_beta_icon_url,
  },
  2: {
    displayName: 'Promo',
    urlName: 'promo',
    setIcon: edition_promo_icon_url,
  },
  3: {
    displayName: 'Reward',
    urlName: 'reward',
    setIcon: edition_reward_icon_url,
  },
  4: {
    displayName: 'Untamed',
    urlName: 'untamed',
    setName: 'untamed',
    setIcon: edition_untamed_icon_url,
  },
  5: {
    displayName: 'Dice',
    urlName: 'dice',
    setName: 'untamed',
  },
  6: {
    displayName: 'Gladius',
    urlName: 'gladius',
    setIcon: edition_gladius_icon_url,
  },
  7: {
    displayName: 'Chaos',
    urlName: 'chaos',
    setName: 'chaos',
    setIcon: edition_chaos_icon_url,
  },
  8: {
    displayName: 'Rift',
    urlName: 'rift',
    setName: 'chaos',
    setIcon: edition_rift_icon_url,
  },
  9: {
    displayName: 'Soulkeep', //mostly ignored in this app
    urlName: 'soulkeep',
    setName: 'soulkeep',
    setIcon: edition_soulkeep_icon_url,
  },
  10: {
    displayName: 'Soulbound', // Soulbound chaos legion
    urlName: 'soulbound',
    setName: 'chaos',
    setIcon: edition_soulbound_icon_url,
  },
  11: {
    displayName: 'Soulkeep ?', // also Soulkeep not sure what this is
    urlName: 'soulkeep',
    setName: 'soulkeep',
    setIcon: edition_soulkeep_icon_url,
  },
  12: {
    displayName: 'Rebellion',
    urlName: 'rebellion',
    setName: 'rebellion',
    setIcon: edition_rebellion_icon_url,
  },
  13: {
    displayName: 'Soulbound Rebellion',
    urlName: 'soulboundrb',
    setName: 'rebellion',
    setIcon: edition_soulbound_rebellion_icon_url,
  },
  14: {
    displayName: 'Conclave Arcana',
    urlName: 'conclave',
    setName: 'conclave',
    setIcon: edition_conclave_arcana_icon_url,
  },
  15: {
    displayName: 'Foundation',
    urlName: 'foundations',
    setName: 'foundation',
    setIcon: edition_foundation_icon_url,
  },
  16: {
    displayName: 'Soulbound Foundation',
    urlName: 'foundations',
    setName: 'foundation',
    setIcon: edition_foundation_icon_url,
  },
  17: {
    displayName: 'Conclave Extra',
    urlName: 'conclave',
    setName: 'conclave',
    setIcon: edition_conclave_extra_icon_url,
  },
  18: {
    displayName: 'Conclave Rewards',
    urlName: 'reward',
    setName: 'conclave',
    setIcon: edition_conclave_rewards_icon_url,
  },
} as const;

export const cardRarityOptions = ['common', 'rare', 'epic', 'legendary'];
export type CardRarity = (typeof cardRarityOptions)[number];
export const cardIconMap: Record<CardRarity, string> = {
  common: card_rarity_common_icon_url,
  rare: card_rarity_rare_icon_url,
  epic: card_rarity_epic_icon_url,
  legendary: card_rarity_legendary_icon_url,
};

export const cardSetOptions = [
  'alpha',
  'beta',
  'untamed',
  'chaos',
  'rebellion',
  'conclave',
  'foundation',
];
export type CardSetName = (typeof cardSetOptions)[number];

export const cardSetIconMap: Record<CardSetName, string> = {
  alpha: edition_alpha_icon_url,
  beta: edition_beta_icon_url,
  untamed: edition_untamed_icon_url,
  chaos: edition_chaos_icon_url,
  rebellion: edition_rebellion_icon_url,
  conclave: edition_conclave_arcana_icon_url,
  foundation: edition_foundation_icon_url,
};

export const cardElementOptions = ['red', 'blue', 'white', 'black', 'green', 'gold', 'gray'];
export type CardElement = (typeof cardElementOptions)[number];

export const cardElementIconMap: Record<string, string> = {
  red: fire_element_icon_url,
  blue: water_element_icon_url,
  white: life_element_icon_url,
  black: death_element_icon_url,
  green: earth_element_icon_url,
  gold: dragon_element_icon_url,
  gray: neutral_element_icon_url,
};

export const cardFoilOptions = ['regular', 'gold', 'gold arcane', 'black', 'black arcane'];
export type CardFoil = (typeof cardFoilOptions)[number];

export const cardFoilSuffixMap: Record<CardFoil, string> = {
  regular: '',
  gold: '_gold',
  'gold arcane': '_gold',
  black: '_blk',
  'black arcane': '_blk',
};

export const cardRoleOptions = ['archon', 'unit'];
export type CardRole = (typeof cardRoleOptions)[number];
export const cardRoleIconMap: Record<CardRole, string> = {
  archon: archon_filter_icon_url,
  unit: unit_filter_icon_url,
};

export interface CardDetail {
  id: number;
  uid: string;
  name: string;
  owner: string;
  xp: number;
  edition: number;
  cardSet: CardSetName;
  collectionPower: number;
  bcx: number;
  setId: string;
  bcxUnbound: number;
  foil: CardFoil;
  mint: string | null;
  level: number;
  imgUrl: string;
}

export interface DetailedPlayerCardCollectionItem {
  cardDetailId: number;
  name: string;
  edition: number;
  tier?: number;
  rarity: CardRarity;
  color: CardElement;
  secondaryColor: CardElement | undefined;
  role: CardRole;
  highestLevelCard?: CardDetail;
  allCards?: CardDetail[];
}

export type DetailedPlayerCardCollection = Record<string, DetailedPlayerCardCollectionItem>;
