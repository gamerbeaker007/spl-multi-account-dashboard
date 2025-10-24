export const WEB_URL = `https://d36mxiodymuqjm.cloudfront.net/`;

export const dec_icon_url = `${WEB_URL}website/icon_dec.png`;
export const credits_icon_url = `${WEB_URL}website/nav/img_credits.png`;
export const gp_icon_url = `${WEB_URL}website/icons/icon_gp_100.png`;
export const gold_icon_url = `${WEB_URL}website/ui_elements/shop/potions/potion_6.png`;
export const legendary_icon_url = `${WEB_URL}website/ui_elements/shop/potions/potion_3.png`;
export const midnight_icon_url = `${WEB_URL}website/icons/img_midnight-potion_400.png`;
export const merits_icon_url = `${WEB_URL}website/icons/img_merit_256.png`;
export const voucher_icon_url = `${WEB_URL}website/icons/img_voucher_chaos-legion_200.png`;
export const glint_icon_url = `${WEB_URL}website/icons/icon_resource_glint.png`;
export const unbind_ca_c_icon_url = `${WEB_URL}website/icons/unbind_common.webp`;
export const unbind_ca_r_icon_url = `${WEB_URL}website/icons/unbind_rare.webp`;
export const unbind_ca_e_icon_url = `${WEB_URL}website/icons/unbind_epic.webp`;
export const unbind_ca_l_icon_url = `${WEB_URL}website/icons/unbind_legendary.webp`;
export const license_icon_url = `${WEB_URL}website/ui_elements/shop/nodes/power_node_activated.png`;
export const sps_icon_url = `${WEB_URL}website/land/resources/sps.png`;
export const energy_icon_url = `${WEB_URL}website/icons/icon_resource_glint.png`;
export const hammer_icon_url = `${WEB_URL}website/land/deedOverview/hammer.svg`;

export const edition_alpha_icon_url = `${WEB_URL}website/icons/icon-edition-alpha.svg`;
export const edition_beta_icon_url = `${WEB_URL}website/icons/icon-edition-beta.svg`;
export const edition_promo_icon_url = `${WEB_URL}website/icons/icon-edition-promo.svg`;
export const edition_reward_icon_url = `${WEB_URL}website/icons/icon-edition-reward.svg`;
export const edition_untamed_icon_url = `${WEB_URL}website/icons/icon-edition-untamed.svg`;
export const edition_dice_icon_url = `${WEB_URL}website/icons/icon-edition-dice.svg`;
export const edition_gladius_icon_url = `${WEB_URL}website/icons/icon-edition-gladius.svg`;
export const edition_chaos_icon_url = `${WEB_URL}website/icons/icon-edition-chaos.svg`;
export const edition_rift_icon_url = `${WEB_URL}website/icons/icon-edition-rift.svg`;
export const edition_soulkeep_icon_url = `${WEB_URL}website/icons/soulkeep/towers.svg`;
export const edition_soulbound_icon_url = edition_reward_icon_url;
export const edition_rebellion_icon_url = `${WEB_URL}website/icons/icon-edition-rebellion.svg`;
export const edition_soulbound_rebellion_icon_url = edition_reward_icon_url;
export const edition_conclave_arcana_icon_url = `${WEB_URL}website/icons/icon-edition-conclave-arcana.svg`;
export const edition_foundation_icon_url = `${WEB_URL}website/icons/icon-edition-foundations.svg`;
export const edition_conclave_extra_icon_url = `${WEB_URL}website/icons/icon-edition-extra.svg`;
export const edition_conclave_rewards_icon_url = edition_reward_icon_url;

export const EDITION_MAPPING = {
  0: 'Alpha',
  1: 'Beta',
  2: 'Promo',
  3: 'Reward',
  4: 'Untamed',
  5: 'Dice',
  6: 'Gladius',
  7: 'Chaos',
  8: 'Rift',
  9: 'Soulkeep', //mostly ignored in this app
  10: 'Soulbound', // Soulbound chaos legion
  11: 'Soulkeep ?', // also Soulkeep not sure what this is
  12: 'Rebellion',
  13: 'Soulbound Rebellion',
  14: 'Conclave Arcana',
  15: 'Foundation',
  16: 'Soulbound Foundation',
  17: 'Conclave Extra',
  18: 'Conclave Rewards',
} as const;

export const EDITION_ICON_MAPPING = {
  0: edition_alpha_icon_url,
  1: edition_beta_icon_url,
  2: edition_promo_icon_url,
  3: edition_reward_icon_url,
  4: edition_untamed_icon_url,
  5: edition_dice_icon_url,
  6: edition_gladius_icon_url,
  7: edition_chaos_icon_url,
  8: edition_rift_icon_url,
  9: edition_soulkeep_icon_url,
  10: edition_soulbound_icon_url,
  11: edition_soulkeep_icon_url,
  12: edition_rebellion_icon_url,
  13: edition_soulbound_rebellion_icon_url,
  14: edition_conclave_arcana_icon_url,
  15: edition_foundation_icon_url,
  16: edition_foundation_icon_url,
  17: edition_conclave_extra_icon_url,
  18: edition_conclave_rewards_icon_url,
} as const;
