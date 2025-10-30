import {
  fetchPlayerHistory,
  fetchPlayerHistoryByDateRange,
  getSeasonDateRange,
} from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import { parsePlayerHistory } from '@/lib/historyParser';
import logger from '@/lib/log/logger.server';
import { aggregateRewards } from '@/lib/rewardAggregator';
import { NextRequest, NextResponse } from 'next/server';

const REWARD_CLAIM_TYPES = 'claim_reward,claim_daily';

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
      logger.info(
        `API route: Getting season date range for season ${seasonId} for player ${player}`
      );
      const seasonRange = await getSeasonDateRange(parseInt(seasonId));
      if (!seasonRange) {
        return NextResponse.json({ error: `Invalid seasonId: ${seasonId}` }, { status: 400 });
      }

      const history = await fetchPlayerHistoryByDateRange(
        player,
        decryptedToken,
        REWARD_CLAIM_TYPES,
        seasonRange.startDate,
        seasonRange.endDate
      );

      // Parse the history entries to typed format
      const parsedEntries = parsePlayerHistory(history);
      const aggregation = aggregateRewards(parsedEntries);

      const result = {
        entries: parsedEntries,
        totalEntries: parsedEntries.length,
        seasonId: seasonId,
        aggregation,
        dateRange: {
          start: seasonRange.startDate.toISOString(),
          end: seasonRange.endDate.toISOString(),
        },
      };
      return NextResponse.json(result);
    } else {
      logger.info(`API route: Fetching single page history for ${player}`);
      const history = await fetchPlayerHistory(player, decryptedToken, REWARD_CLAIM_TYPES);

      // Parse the history entries to typed format
      const parsedEntries = parsePlayerHistory(history);
      const aggregation = aggregateRewards(parsedEntries);

      const result = {
        entries: parsedEntries,
        totalEntries: parsedEntries.length,
        aggregation,
      };

      console.log('API History Result:', aggregation);
      return NextResponse.json(result);
    }
  } catch (error) {
    logger.error(
      `History API route error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return NextResponse.json({ error: 'Failed to fetch player history' }, { status: 500 });
  }
}
