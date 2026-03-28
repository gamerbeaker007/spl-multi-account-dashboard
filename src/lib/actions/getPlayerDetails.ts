'use server';

import { fetchPlayerDetails } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplPlayerDetails } from '@/types/spl/details';
import { cacheLife } from 'next/cache';

export async function getPlayerDetails(user: string): Promise<SplPlayerDetails> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching player details for user: ${user}`);
  try {
    const playerDetails = await fetchPlayerDetails(user);
    logger.info(`Successfully fetched player details for user: ${user}`);
    return playerDetails;
  } catch (error) {
    logger.error(
      `Failed to fetch player details for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch player details for ${user}`);
  }
}
