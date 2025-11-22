import { SplFormat } from '@/types/spl/format';
import {
  foundation_league_icon_url,
  modern_league_icon_url,
  WEB_URL,
  wild_league_icon_url,
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

export const findPackIconUrl = (edition: number): string => {
  const editionName = packIconMap[edition];
  return `${WEB_URL}website/icons/${editionName}`;
};

export function findLeagueLogoUrl(
  format: SplFormat | null,
  league: number | undefined
): string | null {
  if (!format || !league) return null;

  const formatIconUrlMap = {
    foundation: foundation_league_icon_url,
    wild: wild_league_icon_url,
    modern: modern_league_icon_url,
  };

  const leagueIconUrl = formatIconUrlMap[format] || wild_league_icon_url;
  return leagueIconUrl.replace('0.png', `${league}.png`);
}
