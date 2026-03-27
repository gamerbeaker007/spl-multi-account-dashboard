'use server';

import { fetchFrontierDraws, fetchRankedDraws } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { cacheLife } from 'next/cache';

export interface PlayerDrawsData {
  frontier: SplFrontierDrawStatus;
  ranked: SplRankedDrawStatus;
}

export async function getPlayerDraws(user: string): Promise<PlayerDrawsData> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching draws for user: ${user}`);
  try {
    const [frontier, ranked] = await Promise.all([
      fetchFrontierDraws(user),
      fetchRankedDraws(user),
    ]);
    logger.info(`Successfully fetched draws for user: ${user}`);
    return { frontier, ranked };
  } catch (error) {
    logger.error(
      `Failed to fetch draws for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch draws for ${user}`);
  }
}
