'use server';

import {
  fetchBalanceHistoryByDateRange,
  fetchSeasonInfo,
  fetchUnclaimedBalanceHistoryByDateRange,
  getSeasonDateRange,
} from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import logger from '@/lib/log/logger.server';
import {
  BalanceHistoryTokenType,
  SplBalanceHistoryItem,
  SplUnclaimedBalanceHistoryItem,
  TokenBalanceSummary,
} from '@/types/spl/balanceHistory';

// Types that get credited after season ends but belong to the previous season
const GLINT_SPILLOVER_TYPES = [
  'season_rewards',
  'leaderboard_prizes',
  'modern_leaderboard_prizes',
  'affiliate_season_rewards_modern',
  'affiliate_season_rewards_wild',
];

const UNCLAIMED_SPILLOVER_TYPES = ['season'];

const BALANCE_SPILLOVER_TYPES: Partial<Record<BalanceHistoryTokenType, string[]>> = {
  GLINT: GLINT_SPILLOVER_TYPES,
};

function aggregateTokenItems(token: string, items: SplBalanceHistoryItem[]): TokenBalanceSummary {
  const summary: TokenBalanceSummary = {
    token,
    totalEarned: 0,
    totalSpent: 0,
    net: 0,
    byType: {},
  };
  for (const item of items) {
    const amount = Number.parseFloat(item.amount);
    if (amount >= 0) summary.totalEarned += amount;
    else summary.totalSpent += amount;
    summary.net += amount;
    if (!summary.byType[item.type]) {
      summary.byType[item.type] = { earned: 0, spent: 0, count: 0 };
    }
    const t = summary.byType[item.type];
    t.count++;
    if (amount >= 0) t.earned += amount;
    else t.spent += amount;
  }
  return summary;
}

function aggregateUnclaimedItems(items: SplUnclaimedBalanceHistoryItem[]): TokenBalanceSummary[] {
  const byToken: Record<string, TokenBalanceSummary> = {};

  for (const item of items) {
    const amount = Number.parseFloat(item.amount);

    // Positive values are temporary — ignore them
    if (amount >= 0) continue;

    const tokenKey = `UNCLAIMED_${item.token}`;
    if (!byToken[tokenKey]) {
      byToken[tokenKey] = { token: tokenKey, totalEarned: 0, totalSpent: 0, net: 0, byType: {} };
    }
    const summary = byToken[tokenKey];

    const absAmount = Math.abs(amount);
    const toSelf = item.to_player === item.player;

    // Negative to self = earned (rewards credited to this player)
    // Negative to other = spent (delegated/paid out to another player)
    if (toSelf) {
      summary.totalEarned += absAmount;
      summary.net += absAmount;
    } else {
      summary.totalSpent -= absAmount;
      summary.net -= absAmount;
    }

    const typeKey = toSelf ? item.type : `${item.type}_to_${item.to_player}`;
    if (!summary.byType[typeKey]) {
      summary.byType[typeKey] = { earned: 0, spent: 0, count: 0 };
    }
    const t = summary.byType[typeKey];
    t.count++;
    if (toSelf) t.earned += absAmount;
    else t.spent -= absAmount;
  }

  return Object.values(byToken);
}

/** Get the start/end ISO dates for a season, plus spillover window if season has ended. */
export async function getSeasonDates(
  seasonId: number
): Promise<{ start: string; end: string; spilloverEnd: string | null }> {
  const range = await getSeasonDateRange(seasonId);
  const end = range.endDate;

  let spilloverEnd: string | null = null;
  if (end < new Date()) {
    try {
      const nextSeason = await fetchSeasonInfo(seasonId + 1);
      spilloverEnd = new Date(nextSeason.ends).toISOString();
    } catch {
      // Next season doesn't exist yet — no spillover to capture
    }
  }

  return {
    start: range.startDate.toISOString(),
    end: end.toISOString(),
    spilloverEnd,
  };
}

/** Fetch and aggregate a single token's balance history for a date range, including spillover. */
export async function getTokenBalanceSummary(
  username: string,
  encryptedToken: string,
  token: BalanceHistoryTokenType,
  start: string,
  end: string,
  spilloverEnd?: string | null
): Promise<TokenBalanceSummary> {
  const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);
  if (!decryptedToken) throw new Error('Failed to decrypt token');

  const spilloverTypes = BALANCE_SPILLOVER_TYPES[token];

  const rawItems = await fetchBalanceHistoryByDateRange(
    username,
    token,
    decryptedToken,
    new Date(start),
    new Date(end)
  );

  // Exclude spillover types from the main range — they belong to the previous season
  // and will be correctly captured via the spillover fetch for that season.
  const items = spilloverTypes
    ? rawItems.filter(item => !spilloverTypes.includes(item.type))
    : rawItems;

  // Fetch this season's spillover entries from the next season's window
  if (spilloverEnd && spilloverTypes) {
    const spilloverItems = await fetchBalanceHistoryByDateRange(
      username,
      token,
      decryptedToken,
      new Date(end),
      new Date(spilloverEnd)
    );
    const filtered = spilloverItems.filter(item => spilloverTypes.includes(item.type));
    items.push(...filtered);
    logger.info(
      `getTokenBalanceSummary ${username}/${token}: ${filtered.length} spillover items from next season`
    );
  }

  logger.info(`getTokenBalanceSummary ${username}/${token}: ${items.length} total items`);
  return aggregateTokenItems(token, items);
}

/** Fetch and aggregate unclaimed balance history (SPS + VOUCHER), including spillover. */
export async function getUnclaimedSummaries(
  username: string,
  encryptedToken: string,
  start: string,
  end: string,
  spilloverEnd?: string | null
): Promise<TokenBalanceSummary[]> {
  const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);
  if (!decryptedToken) throw new Error('Failed to decrypt token');

  const rawItems = await fetchUnclaimedBalanceHistoryByDateRange(
    username,
    ['SPS', 'VOUCHER'],
    decryptedToken,
    new Date(start),
    new Date(end)
  );

  // Exclude spillover types from the main range — they belong to the previous season
  const items = rawItems.filter(item => !UNCLAIMED_SPILLOVER_TYPES.includes(item.type));

  // Fetch this season's spillover entries from the next season's window
  if (spilloverEnd) {
    const spilloverItems = await fetchUnclaimedBalanceHistoryByDateRange(
      username,
      ['SPS', 'VOUCHER'],
      decryptedToken,
      new Date(end),
      new Date(spilloverEnd)
    );
    const filtered = spilloverItems.filter(item => UNCLAIMED_SPILLOVER_TYPES.includes(item.type));
    items.push(...filtered);
    logger.info(
      `getUnclaimedSummaries ${username}: ${filtered.length} spillover items from next season`
    );
  }

  logger.info(`getUnclaimedSummaries ${username}: ${items.length} total items`);
  return aggregateUnclaimedItems(items);
}
