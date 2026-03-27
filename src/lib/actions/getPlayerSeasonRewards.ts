'use server';

import { fetchCurrentRewards } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import { cacheLife } from 'next/cache';

export async function getPlayerSeasonRewards(user: string): Promise<SPLSeasonRewards> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching season rewards for user: ${user}`);
  try {
    const rewards = await fetchCurrentRewards(user);
    logger.info(`Successfully fetched season rewards for user: ${user}`);
    return rewards;
  } catch (error) {
    logger.error(
      `Failed to fetch season rewards for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch season rewards for ${user}`);
  }
}
