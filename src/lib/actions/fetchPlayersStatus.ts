'use server';

// Server action for fetching player status
import logger from '@/lib/log/logger.server';
import {
  fetchCurrentSeasonId,
  fetchFrontierDraws,
  fetchPlayerBalances,
  fetchPlayerDetails,
  fetchRankedDraws,
} from '@/lib/api/splApi';

export async function fetchPlayersStatus(users: string[]) {
  try {
    if (!users || !Array.isArray(users) || users.length === 0) {
      throw new Error('Users array is required');
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
          `Failed to fetch data for user ${user} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        playerData.push({
          username: user,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Successfully fetched complete status data for all users ${users.length}`);
    logger.info(`Current season ID: ${seasonId}`);

    return {
      players: playerData,
      timestamp: new Date().toISOString(),
      seasonId: seasonId,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account status action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
