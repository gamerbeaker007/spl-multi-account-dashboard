'use server';

import {
  fetchBalanceHistoryByDateRange,
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

function aggregateTokenItems(token: string, items: SplBalanceHistoryItem[]): TokenBalanceSummary {
  const summary: TokenBalanceSummary = {
    token,
    totalEarned: 0,
    totalSpent: 0,
    net: 0,
    byType: {},
  };
  for (const item of items) {
    const amount = parseFloat(item.amount);
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

function aggregateUnclaimedItems(items: SplUnclaimedBalanceHistoryItem[]): TokenBalanceSummary {
  const summary: TokenBalanceSummary = {
    token: 'UNCLAIMED_SPS',
    totalEarned: 0,
    totalSpent: 0,
    net: 0,
    byType: {},
  };
  for (const item of items) {
    const amount = parseFloat(item.amount);
    if (amount >= 0) summary.totalEarned += amount;
    else summary.totalSpent += amount;
    summary.net += amount;
    const typeKey =
      item.reward_action === 'claimed'
        ? `claimed_${item.type}${item.to_player !== item.player ? `_to_${item.to_player}` : ''}`
        : item.type;
    if (!summary.byType[typeKey]) {
      summary.byType[typeKey] = { earned: 0, spent: 0, count: 0 };
    }
    const t = summary.byType[typeKey];
    t.count++;
    if (amount >= 0) t.earned += amount;
    else t.spent += amount;
  }
  return summary;
}

/** Get the start/end ISO dates for a season. */
export async function getSeasonDates(seasonId: number): Promise<{ start: string; end: string }> {
  const range = await getSeasonDateRange(seasonId);
  return {
    start: range.startDate.toISOString(),
    end: range.endDate.toISOString(),
  };
}

/** Fetch and aggregate a single token's balance history for a date range. */
export async function getTokenBalanceSummary(
  username: string,
  encryptedToken: string,
  token: BalanceHistoryTokenType,
  start: string,
  end: string
): Promise<TokenBalanceSummary> {
  const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);
  if (!decryptedToken) throw new Error('Failed to decrypt token');

  const items = await fetchBalanceHistoryByDateRange(
    username,
    token,
    decryptedToken,
    new Date(start),
    new Date(end)
  );

  logger.info(`getTokenBalanceSummary ${username}/${token}: ${items.length} items`);
  return aggregateTokenItems(token, items);
}

/** Fetch and aggregate unclaimed SPS balance history for a date range. */
export async function getUnclaimedSPSSummary(
  username: string,
  encryptedToken: string,
  start: string,
  end: string
): Promise<TokenBalanceSummary> {
  const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);
  if (!decryptedToken) throw new Error('Failed to decrypt token');

  const items = await fetchUnclaimedBalanceHistoryByDateRange(
    username,
    ['SPS'],
    decryptedToken,
    new Date(start),
    new Date(end)
  );

  logger.info(`getUnclaimedSPSSummary ${username}: ${items.length} items`);
  return aggregateUnclaimedItems(items);
}
