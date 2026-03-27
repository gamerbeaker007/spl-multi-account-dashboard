'use server';

import { fetchPlayerBalances } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplBalance } from '@/types/spl/balances';
import { cacheLife } from 'next/cache';

export async function getPlayerBalances(user: string): Promise<SplBalance[]> {
  'use cache';
  cacheLife('minutes');

  logger.info(`Fetching balances for user: ${user}`);
  try {
    const balances = await fetchPlayerBalances(user);
    logger.info(`Successfully fetched balances for user: ${user}`);
    return balances;
  } catch (error) {
    logger.error(
      `Failed to fetch balances for user ${user}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(`Failed to fetch balances for ${user}`);
  }
}
