import {
  fetchCurrentSeasonId,
  fetchFrontierDraws,
  fetchPlayerBalances,
  fetchPlayerDetails,
  fetchRankedDraws,
} from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // array with users as input
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }

    logger.info(`Fetching complete status for users: ${users}`);

    const playerData = [];
    const seasonId = await fetchCurrentSeasonId(users[0]);

    for (const user of users) {
      try {
        const [balances, frontierDraws, rankedDraws, playerDetails] = await Promise.all([
          fetchPlayerBalances(user),
          fetchFrontierDraws(user),
          fetchRankedDraws(user),
          fetchPlayerDetails(user),
        ]);

        // Compile into a nice JSON response
        const userData = {
          username: user,
          balances,
          draws: {
            frontier: frontierDraws,
            ranked: rankedDraws,
          },
          playerDetails,
        };

        playerData.push(userData);
      } catch (userError) {
        logger.error(
          `Failed to fetch data for user ${user.username} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        // Continue processing other users even if one fails
        playerData.push({
          username: user.username,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Successfully fetched complete status data for all users ${users.length}`);
    logger.info(`Current season ID: ${seasonId}`);
    return NextResponse.json({
      players: playerData,
      timestamp: new Date().toISOString(),
      seasonId: seasonId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account status API error: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
