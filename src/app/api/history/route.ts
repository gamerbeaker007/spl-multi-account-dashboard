import { fetchPlayerHistoryByDateRange, getSeasonDateRange } from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import { parseHistoryEntry, parsePurchaseEntry } from '@/lib/historyParser';
import logger from '@/lib/log/logger.server';
import {
  aggregatePurchaseRewards,
  aggregateRewards,
  mergeRewardSummaries,
} from '@/lib/rewardAggregator';
import { NextRequest, NextResponse } from 'next/server';

const ALL_HISTORY_TYPES = 'claim_reward,claim_daily,purchase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const player = searchParams.get('player');
    const seasonId = searchParams.get('seasonId');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!player || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters: player and authorization header' },
        { status: 400 }
      );
    }

    const decryptedToken = await decryptToken(token, process.env.SECRET_ENCRYPTION_KEY!);

    // Check if this is a date range request
    if (seasonId) {
      logger.info(`API route: Getting season rewards for player ${player} for season ${seasonId}`);
      const seasonRange = await getSeasonDateRange(parseInt(seasonId));
      if (!seasonRange) {
        return NextResponse.json({ error: `Invalid seasonId: ${seasonId}` }, { status: 400 });
      }

      // Fetch all history types in a single call
      const allHistory = await fetchPlayerHistoryByDateRange(
        player,
        decryptedToken,
        ALL_HISTORY_TYPES,
        seasonRange.startDate,
        seasonRange.endDate
      );

      // Separate entries by type and parse accordingly
      const dailyEntries = allHistory.filter(e => e.type === 'claim_daily').map(parseHistoryEntry);

      const leagueEntries = allHistory
        .filter(e => e.type === 'claim_reward')
        .map(parseHistoryEntry);

      const purchaseEntries = allHistory
        .filter(e => e.type === 'purchase')
        .map(parsePurchaseEntry)
        .filter(entry => entry !== undefined);

      // Aggregate each category
      const dailyAggregation = aggregateRewards(dailyEntries);
      const leagueAggregation = aggregateRewards(leagueEntries);
      const purchaseAggregation = aggregatePurchaseRewards(purchaseEntries);

      // Merge all aggregations
      const totalAggregation = mergeRewardSummaries(
        dailyAggregation,
        leagueAggregation,
        purchaseAggregation
      );

      const result = {
        dailyEntries,
        leagueEntries,
        purchaseEntries,
        totalEntries: dailyEntries.length + leagueEntries.length + purchaseEntries.length,
        seasonId: seasonId,
        aggregation: totalAggregation,
        dateRange: {
          start: seasonRange.startDate.toISOString(),
          end: seasonRange.endDate.toISOString(),
        },
      };
      return NextResponse.json(result);
    } else {
      logger.info(
        `API route: Single page fetch not supported for new structure - use seasonId parameter`
      );
      return NextResponse.json(
        { error: 'Please provide seasonId parameter for fetching history' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error(
      `History API route error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return NextResponse.json({ error: 'Failed to fetch player history' }, { status: 500 });
  }
}
