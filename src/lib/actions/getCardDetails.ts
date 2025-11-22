'use server';
// Server action for fetching card details
import logger from '@/lib/log/logger.server';
import { fetchCardDetails } from '@/lib/api/splApi';
import { cacheLife } from 'next/cache';

export async function getCardDetails() {
  'use cache';
  cacheLife('days');

  try {
    logger.info('Fetching card details via server action');
    const data = await fetchCardDetails();
    logger.info(`Card details server action completed: ${data.length} cards`);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Card details action error: ${errorMessage}`);
    throw new Error('Failed to fetch card details');
  }
}
