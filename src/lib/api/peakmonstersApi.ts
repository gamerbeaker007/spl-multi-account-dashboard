import { PeakmonstersMarketPriceEntry, PeakmonstersMarketPrices } from '@/types/peakmonsters/market';
import axios from 'axios';
import * as rax from 'retry-axios';
import logger from '../log/logger.server';

const pkmClient = axios.create({
  baseURL: 'https://peakmonsters.com/api',
  timeout: 60000,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'User-Agent': 'SPL-Data/1.0',
  },
});

rax.attach(pkmClient);
pkmClient.defaults.raxConfig = {
  retry: 10,
  retryDelay: 1000,
  backoffType: 'exponential',
  statusCodesToRetry: [
    [429, 429],
    [500, 599],
  ],
  onRetryAttempt: async err => {
    const cfg = rax.getConfig(err);
    logger.warn(`Retry attempt #${cfg?.currentRetryAttempt}`);
  },
};

//   'https://peakmonsters.com/api/market/cards/prices' \
export async function fetchMarketPrices(): Promise<PeakmonstersMarketPriceEntry[]> {
  const url = '/market/cards/prices';
  logger.info('Fetching market prices from Peakmonsters API');

  try {
    const res = await pkmClient.get(url);
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Peakmonsters API: expected array');
    }

    return data.prices as PeakmonstersMarketPriceEntry[];
  } catch (error) {
    logger.error(
      `Failed to fetch market for sale grouped: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}
