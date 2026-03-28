'use server';

import { fetchBrawlDetails } from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import logger from '@/lib/log/logger.server';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { cacheLife } from 'next/cache';

export async function getPlayerBrawl(
  guildId: string,
  tournamentId: string,
  user: string,
  encryptedToken?: string | null
): Promise<SplBrawlDetails> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching brawl details for user: ${user}`);
  try {
    const token = encryptedToken
      ? await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!)
      : undefined;
    const brawlDetails = await fetchBrawlDetails(guildId, tournamentId, user, token);
    logger.info(`Successfully fetched brawl details for user: ${user}`);
    return brawlDetails;
  } catch (error) {
    logger.error(
      `Failed to fetch brawl details for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch brawl details for ${user}`);
  }
}
