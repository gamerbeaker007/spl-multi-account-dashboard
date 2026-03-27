'use server';

import { fetchBrawlDetails, fetchPlayerDetails } from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import logger from '@/lib/log/logger.server';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { SplPlayerDetails } from '@/types/spl/details';
import { cacheLife } from 'next/cache';

export interface PlayerDetailsData {
  playerDetails: SplPlayerDetails;
  brawlDetails?: SplBrawlDetails;
}

export async function getPlayerDetails(
  user: string,
  encryptedToken?: string | null
): Promise<PlayerDetailsData> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching player details for user: ${user}`);
  try {
    const playerDetails = await fetchPlayerDetails(user);

    let brawlDetails: SplBrawlDetails | undefined;
    if (playerDetails.guild?.id) {
      const token = encryptedToken
        ? await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!)
        : undefined;
      brawlDetails = (await fetchBrawlDetails(
        playerDetails.guild.id,
        playerDetails.guild.tournament_id,
        user,
        token
      )) as SplBrawlDetails;
    }

    logger.info(`Successfully fetched player details for user: ${user}`);
    return { playerDetails, brawlDetails };
  } catch (error) {
    logger.error(
      `Failed to fetch player details for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch player details for ${user}`);
  }
}
