'use server';
import { decryptToken } from '@/lib/auth/encryption';
import logger from '@/lib/log/logger.server';
import { fetchPlayerHistoryByDateRange, getSeasonDateRange } from '@/lib/api/splApi';
import { ParsedHistory, PurchaseResult } from '@/types/parsedHistory';
import {
  aggregatePurchaseRewards,
  aggregateRewards,
  mergeRewardSummaries,
} from '@/lib/rewardAggregator';

const ALL_HISTORY_TYPES = 'claim_reward,claim_daily,purchase';

// Server action for fetching player history
export async function fetchPlayerHistory(
  player: string,
  encryptedToken: string,
  seasonId?: number
) {
  try {
    if (!player || !encryptedToken) {
      throw new Error('Missing required parameters: player and token');
    }

    const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);

    if (!decryptedToken) {
      throw new Error('Failed to decrypt token');
    }

    if (seasonId) {
      logger.info(`Getting season rewards for player ${player} for season ${seasonId}`);
      const seasonRange = await getSeasonDateRange(seasonId);

      if (!seasonRange) {
        throw new Error(`Invalid seasonId: ${seasonId}`);
      }

      const allHistory = await fetchPlayerHistoryByDateRange(
        player,
        decryptedToken,
        ALL_HISTORY_TYPES,
        seasonRange.startDate,
        seasonRange.endDate
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
