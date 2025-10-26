import { LoginResponse } from '@/types/spl/auth';
import { SplBalance } from '@/types/spl/balances';
import { SplCardCollection } from '@/types/spl/card';
import { SplDailyProgress } from '@/types/spl/dailies';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SplFormat } from '@/types/spl/format';
import { SplLeaderboardResponse } from '@/types/spl/leaderboard';
import { SplCardListingPriceEntry } from '@/types/spl/market';
import axios from 'axios';
import * as rax from 'retry-axios';
import { validateSplJwt } from '../auth/jwt/splJwtValidation';
import logger from '../log/logger.server';

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
export async function fetchPlayerBalances(username: string): Promise<SplBalance[]> {
  const url = '/players/balances';
  logger.debug('Fetching player balances from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

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
export async function fetchRankedDraws(username: string): Promise<SplRankedDrawStatus> {
  const url = '/ranked_draws/status';
  logger.debug('Fetching ranked draws from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
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
export async function fetchFrontierDraws(username: string): Promise<SplFrontierDrawStatus> {
  const url = '/frontier_draws/status';
  logger.debug('Fetching frontier draws from Splinterlands API');

  const params = {
    username: username,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
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
  logger.debug('Fetching leaderboard with player from Splinterlands API');

  const params = {
    username: username,
    format: format,
  };

  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SplLeaderboardResponse;
  } catch (error) {
    logger.error(
      `Failed to fetch frontier draws: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

//   'https://api.splinterlands.com/market/for_sale_grouped' \
export async function fetchListingPrices(): Promise<SplCardListingPriceEntry[]> {
  const url = '/market/for_sale_grouped';
  logger.debug('Fetching market for sale grouped from Splinterlands API');

  try {
    const res = await splBaseClient.get(url);
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SplCardListingPriceEntry[];
  } catch (error) {
    logger.error(
      `Failed to fetch market for sale grouped: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

//   'https://api.splinterlands.com/cards/collection/beaker007' \
export async function fetchCardCollection(username: string): Promise<SplCardCollection> {
  const url = '/cards/collection/' + encodeURIComponent(username);
  logger.debug('Fetching card collection from Splinterlands API');

  try {
    const res = await splBaseClient.get(url);
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SplCardCollection;
  } catch (error) {
    logger.error(
      `Failed to fetch card collection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Helper function to get the JWT token from cookies in server-side contexts
 */
export async function getAuthorizationHeader(
  player: string,
  decryptedToken: string
): Promise<Record<string, string> | undefined> {
  try {
    const authToken = await validateSplJwt(decryptedToken);
    const headers: Record<string, string> = {};
    if (authToken && authToken.valid && authToken.username === player) {
      headers.Authorization = `Bearer ${decryptedToken}`;
      logger.debug(`Using Bearer token for authenticated request`);
    }

    return headers ? headers : undefined;
  } catch (error) {
    logger.warn(`Failed to read auth token from cookies: ${JSON.stringify(error)}`);
    return undefined;
  }
}

//https://api.splinterlands.com/dailies/progress?format=modern
export async function fetchDailyProgress(
  player: string,
  decryptedToken: string,
  format: SplFormat
): Promise<SplDailyProgress> {
  const url = '/dailies/progress';
  logger.debug('Fetching daily progress from Splinterlands API');

  const params = {
    format: format,
  };
  const headers = await getAuthorizationHeader(player, decryptedToken);

  try {
    const res = await splBaseClient.get(url, { params, headers });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data;
  } catch (error) {
    logger.error(
      `Failed to fetch daily progress: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

export async function splLogin(
  username: string,
  timestamp: number,
  signature: string
): Promise<LoginResponse> {
  const url = 'players/v2/login';

  logger.info(`splLogin called for user: ${username}`);
  const params = {
    name: username,
    ts: timestamp,
    sig: signature,
  };

  try {
    const response = await splBaseClient.get(url, {
      params: { ...params },
    });

    if (response.status === 200 && response.data) {
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      const result = response.data as LoginResponse;

      return result as LoginResponse;
    } else {
      throw new Error('Login request failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object' && 'error' in errorData) {
        throw new Error(errorData.error);
      }
      throw new Error(error.message || 'Network error occurred');
    }
    throw error;
  }
}
