import {
  energy_icon_url,
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  reward_draw_major_icon_url,
  unbind_ca_c_icon_url,
  unbind_ca_e_icon_url,
  unbind_ca_l_icon_url,
  unbind_ca_r_icon_url,
  WEB_URL,
} from './staticsIconUrls';

export const largeNumberFormat = (balance: string | number) => {
  const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
  }).format(numValue);
};

export const calculateEnergy = (ecr: number, lastUpdatedTime: string): number => {
  const lastUpdatedTimeDate = new Date(lastUpdatedTime);

  const msInOneHour = 60 * 60 * 1000; // Milliseconds in one hour
  const hourlyRechargeRate = 1; // Example hourly recharge rate

  const currentTimeMs = Date.now(); // Current time in milliseconds
  const lastUpdatedTimeMs = lastUpdatedTimeDate.getTime(); // Convert to milliseconds

  const regeneratedEnergy =
    ((currentTimeMs - lastUpdatedTimeMs) / msInOneHour) * hourlyRechargeRate;

  const ecrValue = typeof ecr === 'string' ? parseFloat(ecr) : ecr;
  const energy = Math.floor(regeneratedEnergy + ecrValue);

  return Math.min(energy, 50);
};

export const leagueNames = [
  'Novice',
  'Bronze III',
  'Bronze II',
  'Bronze I',
  'Silver III',
  'Silver II',
  'Silver I',
  'Gold III',
  'Gold II',
  'Gold I',
  'Diamond III',
  'Diamond II',
  'Diamond I',
  'Champion III',
  'Champion II',
  'Champion I',
];

const packIconMap: { [key: string]: string } = {
  1: 'icon_pack_beta.png',
  7: 'img_pack_chaos-legion_200.png',
  8: 'img_pack_riftwatchers_opt.png',
  15: 'img_pack_foundations_250.png',
};

export const findPackIconUrl = (edition: string): string => {
  const editionName = packIconMap[edition];
  return `${WEB_URL}website/icons/${editionName}`;
};

export const editionNames: { [key: string]: string } = {
  1: 'Beta',
  7: 'Chaos Legion',
  8: 'Riftwatchers',
  15: 'Foundations',
};

export const logoMap: { [key: string]: string } = {
  gold: gold_icon_url,
  legendary: legendary_icon_url,
  merits: merits_icon_url,
  energy: energy_icon_url,
  common_scroll: unbind_ca_c_icon_url,
  rare_scroll: unbind_ca_r_icon_url,
  epic_scroll: unbind_ca_e_icon_url,
  legendary_scroll: unbind_ca_l_icon_url,
  card: reward_draw_major_icon_url,
};
