'use server';
import { fetchPlayerHistoryByDateRange, getSeasonDateRange } from '@/lib/api/splApi';
import { getUserTokenCookie } from '@/lib/auth/cookies';
import logger from '@/lib/log/logger.server';
import {
  aggregatePurchaseRewards,
  aggregateRewards,
  mergeRewardSummaries,
} from '@/lib/rewardAggregator';
import { ParsedHistory, PurchaseResult } from '@/types/parsedHistory';
import { cacheLife } from 'next/cache';

const ALL_HISTORY_TYPES = 'claim_reward,claim_daily,purchase';

// Server action for fetching player history
export async function getPlayerHistory(player: string, seasonId?: number) {
  if (!player) {
    throw new Error('Missing required parameter: player');
  }

  // Fetch token from cookies BEFORE cache scope
  const encryptedToken = await getUserTokenCookie(player);

  return await getPlayerHistoryCached(player, encryptedToken, seasonId);
}

async function getPlayerHistoryCached(player: string, encryptedToken: string | null, seasonId?: number) {
  'use cache';
  cacheLife('minutes');

  try {

    if (seasonId) {
      logger.info(`Getting season rewards for player ${player} for season ${seasonId}`);
      const seasonRange = await getSeasonDateRange(seasonId);

      if (!seasonRange) {
        throw new Error(`Invalid seasonId: ${seasonId}`);
      }

      const allHistory = await fetchPlayerHistoryByDateRange(
        player,
        ALL_HISTORY_TYPES,
        seasonRange.startDate,
        seasonRange.endDate,
        encryptedToken
      );

      const purchaseEntries = allHistory
        .filter(
          (e): e is ParsedHistory & { type: 'purchase'; result: PurchaseResult } =>
            e.type === 'purchase' && e.result !== null
        )
        .map(e => e.result);

      const dailyAggregation = aggregateRewards(allHistory);
      const purchaseAggregation = aggregatePurchaseRewards(purchaseEntries);
      const totalAggregation = mergeRewardSummaries(dailyAggregation, purchaseAggregation);

      return {
        allEntries: allHistory,
        totalEntries: allHistory.length,
        seasonId: seasonId,
        aggregation: totalAggregation,
        dateRange: {
          start: seasonRange.startDate.toISOString(),
          end: seasonRange.endDate.toISOString(),
        },
      };
    } else {
      throw new Error('Please provide seasonId parameter for fetching history');
    }
  } catch (error) {
    logger.error(
      `History action error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error('Failed to fetch player history');
  }
}
