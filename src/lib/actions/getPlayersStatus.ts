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
import logger from '@/lib/log/logger.server';
import { PlayerStatusData } from '@/types/playerStatus';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { cacheLife } from 'next/cache';
import { decryptToken } from '../auth/encryption';

export async function getPlayersStatus(
  user: string,
  encryptedToken?: string | undefined | null
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
        const token = encryptedToken
          ? await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!)
          : undefined;

        brawlDetails = await fetchBrawlDetails(guildId, tournamentId, playerData.username, token);
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
