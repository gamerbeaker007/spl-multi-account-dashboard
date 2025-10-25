import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/log/logger.server';
import {
  fetchFrontierDraws,
  fetchLeaderboardWithPlayer,
  fetchPlayerBalances,
  fetchRankedDraws,
} from '@/lib/api/splApi';

export async function POST(request: NextRequest) {
  try {
    // array with users as input
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }

    logger.info(`Multi-account status API route called for ${users.length} users`);

    const playerData = [];

    for (const user of users) {
      try {
        logger.info(`Fetching data for user: ${user}`);

        const [
          balances,
          frontierDraws,
          rankedDraws,
          leaderboardWild,
          leaderboardFoundation,
          leaderboardModern,
        ] = await Promise.all([
          fetchPlayerBalances(user),
          fetchFrontierDraws(user),
          fetchRankedDraws(user),
          fetchLeaderboardWithPlayer(user, 'wild'),
          fetchLeaderboardWithPlayer(user, 'foundation'),
          fetchLeaderboardWithPlayer(user, 'modern'),
        ]);

        // Compile into a nice JSON response
        const userData = {
          username: user,
          balances,
          draws: {
            frontier: frontierDraws,
            ranked: rankedDraws,
          },
          leaderboards: {
            wild: leaderboardWild?.player || null,
            foundation: leaderboardFoundation?.player || null,
            modern: leaderboardModern?.player || null,
          },
        };

        playerData.push(userData);
      } catch (userError) {
        logger.error(
          `Failed to fetch data for user ${user}: ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        // Continue processing other users even if one fails
        playerData.push({
          username: user,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Multi-account status API route completed: ${playerData.length} users processed`);
    return NextResponse.json({
      players: playerData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account status API error: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
