import axios from 'axios';
import * as rax from 'retry-axios';
import logger from '../log/logger.server';
import { SplBalance } from '@/types/spl/balances';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SplFormat } from '@/types/spl/format';
import { SplLeaderboardResponse } from '@/types/spl/leaderboard';

const splBaseClient = axios.create({
  baseURL: 'https://api.splinterlands.com',
  timeout: 60000,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'User-Agent': 'SPL-Data/1.0',
  },
});

rax.attach(splBaseClient);
splBaseClient.defaults.raxConfig = {
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

// https://api.splinterlands.com/players/balances?username=beaker007
/**
 * Fetch player balances from Splinterlands API
 */
export async function fetchPlayerBalances(
  username: string
): Promise<SplBalance[]> {
  const url = '/players/balances';
  logger.info('Fetching player balances from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data || !Array.isArray(data)) {
      throw new Error(
        'Invalid response from Splinterlands API: expected array'
      );
    }

    logger.info(`Fetched ${data.length} player balances`);

    return data as SplBalance[];
  } catch (error) {
    logger.error(
      `Failed to fetch player balances: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

// https://api.splinterlands.com/ranked_draws/status?username=beaker007
/**
 * Fetch Ranked Draws from Splinterlands API
 */
export async function fetchRankedDraws(
  username: string
): Promise<SplRankedDrawStatus> {
  const url = '/ranked_draws/status';
  logger.info('Fetching ranked draws from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error(
        'Invalid response from Splinterlands API: expected array'
      );
    }

    return data as SplRankedDrawStatus;
  } catch (error) {
    logger.error(
      `Failed to fetch ranked draws: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

// https://api.splinterlands.com/frontier_draws/status?username=beaker007
/**
 * Fetch frontier draws from Splinterlands API
 */
export async function fetchFrontierDraws(
  username: string
): Promise<SplFrontierDrawStatus> {
  const url = '/frontier_draws/status';
  logger.info('Fetching frontier draws from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error(
        'Invalid response from Splinterlands API: expected array'
      );
    }

    return data as SplFrontierDrawStatus;
  } catch (error) {
    logger.error(
      `Failed to fetch frontier draws: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

//   'https://api.splinterlands.com/players/leaderboard_with_player?&format=fountdation&username=beaker007' \
export async function fetchLeaderboardWithPlayer(
  username: string,
  format: SplFormat
): Promise<SplLeaderboardResponse> {
  const url = '/players/leaderboard_with_player';
  logger.info('Fetching leaderboard with player from Splinterlands API');

  const params = {
    username: username,
    format: format,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error(
        'Invalid response from Splinterlands API: expected array'
      );
    }

    return data as SplLeaderboardResponse;
  } catch (error) {
    logger.error(
      `Failed to fetch frontier draws: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}
