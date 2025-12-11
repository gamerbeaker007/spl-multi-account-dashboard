'use server';

// Server action for fetching player status
import {
  fetchBrawlDetails,
  fetchCurrentRewards,
  fetchFrontierDraws,
  fetchPlayerBalances,
  fetchPlayerDetails,
  fetchRankedDraws,
} from '@/lib/api/splApi';
import { getUserTokenCookie } from '@/lib/auth/cookies';
import logger from '@/lib/log/logger.server';
import { PlayerStatusData } from '@/types/playerStatus';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { cacheLife } from 'next/cache';

export async function getPlayersStatus(
  user: string
): Promise<PlayerStatusData> {
  // Fetch token from cookies BEFORE cache scope
  const encryptedToken = await getUserTokenCookie(user);

  return await getPlayersStatusCached(user, encryptedToken);
}

async function getPlayersStatusCached(
  user: string,
  encryptedToken: string | null
): Promise<PlayerStatusData> {
  'use cache';
  cacheLife('minutes');

  try {
    logger.info(`Fetching complete status for users: ${user}`);

    const playerData: PlayerStatusData = {
      username: user,
      timestamp: new Date().toISOString(),
    };

    try {
      const [balances, frontierDraws, rankedDraws, playerDetails, currenSeasonRewards] =
        await Promise.all([
          fetchPlayerBalances(user),
          fetchFrontierDraws(user),
          fetchRankedDraws(user),
          fetchPlayerDetails(user),
          fetchCurrentRewards(user),
        ]);

      let brawlDetails = null;
      if (playerDetails.guild?.id) {
        const guildId = playerDetails.guild.id;
        const tournamentId = playerDetails.guild.tournament_id;

        brawlDetails = await fetchBrawlDetails(guildId, tournamentId, playerData.username, encryptedToken);
      }

      logger.info(`Successfully fetched complete status data for all user ${user}`);
      return {
        ...playerData,
        balances,
        draws: {
          frontier: frontierDraws,
          ranked: rankedDraws,
        },
        playerDetails,
        seasonRewards: currenSeasonRewards,
        brawlDetails: brawlDetails as SplBrawlDetails,
      };
    } catch (userError) {
      logger.error(
        `Failed to fetch data for user ${user} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
      );
      return {
        ...playerData,
        error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account status action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
