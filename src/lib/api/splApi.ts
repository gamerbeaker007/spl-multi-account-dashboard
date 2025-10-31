import { LoginResponse } from '@/types/spl/auth';
import { SplBalance } from '@/types/spl/balances';
import { SplCardCollection } from '@/types/spl/card';
import { SplDailyProgress } from '@/types/spl/dailies';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SplFormat } from '@/types/spl/format';
import { SplHistory } from '@/types/spl/history';
import { SplCardListingPriceEntry } from '@/types/spl/market';
import { SplSeasonInfo } from '@/types/spl/season';
import axios from 'axios';
import * as rax from 'retry-axios';
import { validateSplJwt } from '../auth/jwt/splJwtValidation';
import logger from '../log/logger.server';
import { SplCardDetail } from '@/types/spl/cardDetails';

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

//https://api.splinterlands.com/players/details?name=beaker007&season_details=true&format=all
export async function fetchPlayerDetails(player: string): Promise<SplPlayerDetails> {
  const url = '/players/details';
  logger.debug('Fetching player details from Splinterlands API');
  const params = {
    name: player,
    season_details: true,
    format: 'all',
  };
  try {
    const res = await splBaseClient.get(url, { params });
    const data = res.data;
    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }
    return data as SplPlayerDetails;
  } catch (error) {
    logger.error(
      `Failed to fetch player details: ${error instanceof Error ? error.message : 'Unknown error'}`
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

/**
 * Get season date range by fetching current and previous season info
 */
export async function getSeasonDateRange(seasonId: number): Promise<{
  startDate: Date;
  endDate: Date;
}> {
  logger.debug(`Getting date range for season ${seasonId}`);

  try {
    // Fetch current season
    const currentSeason = await fetchSeasonInfo(seasonId);
    const previousSeason = await fetchSeasonInfo(seasonId - 1);
    return { startDate: new Date(previousSeason.ends), endDate: new Date(currentSeason.ends) };
  } catch (error) {
    logger.error(
      `Failed to get season date range for ${seasonId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

// https://api.splinterlands.com/season
/**
 * Fetch season information including start and end dates
 */
export async function fetchSeasonInfo(seasonId: number): Promise<SplSeasonInfo> {
  const url = '/season';
  logger.debug(`Fetching season info for season: ${seasonId}`);

  try {
    const response = await splBaseClient.get(url, {
      params: { id: seasonId },
    });

    if (response.status === 200 && response.data) {
      // Handle API-level error even if HTTP status is 200
      if (!response.data) {
        throw new Error('Invalid response from Splinterlands API: no season data');
      }

      return response.data as SplSeasonInfo;
    } else {
      throw new Error('Season info request failed');
    }
  } catch (error) {
    logger.error(
      `Failed to fetch season info for ${seasonId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Fetch card details from Splinterlands API
 */
export async function fetchCardDetails(): Promise<SplCardDetail[]> {
  const url = '/cards/get_details';
  logger.debug('Fetching card details from Splinterlands API');

  try {
    const res = await splBaseClient.get(url);
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SplCardDetail[];
  } catch (error) {
    logger.error(
      `Failed to fetch card details: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

// https://api.splinterlands.com/players/history
/**
 * Fetch single page of player history from Splinterlands API
 */
export async function fetchPlayerHistory(
  player: string,
  decryptedToken: string,
  types: string, // comma-separated list of types
  beforeBlock?: number
): Promise<SplHistory[]> {
  const url = '/players/history';
  logger.debug(`Fetching player history for player: ${player}`);

  // Build query parameters
  const params: Record<string, string | number> = {
    username: player,
    types,
    limit: DEFAULT_LIMIT,
  };

  if (beforeBlock) {
    params.before_block = beforeBlock;
  }

  try {
    // Get authorization header
    const authHeaders = await getAuthorizationHeader(player, decryptedToken);

    const response = await splBaseClient.get(url, {
      params,
      headers: authHeaders,
    });

    if (response.status === 200 && response.data) {
      // Handle API-level error even if HTTP status is 200
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from Splinterlands API: expected array');
      }

      return response.data as SplHistory[];
    } else {
      throw new Error('History request failed');
    }
  } catch (error) {
    logger.error(
      `Failed to fetch player history for ${player}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

const DEFAULT_DELAY_MS = 150;
const DEFAULT_LIMIT = 500;
/**
 * Recursively fetch player history between two dates
 * Uses before_block parameter to paginate through results
 */
export async function fetchPlayerHistoryByDateRange(
  player: string,
  decryptedToken: string,
  types: string,
  startDate: Date,
  endDate: Date
): Promise<SplHistory[]> {
  logger.debug(
    `Fetching player history for ${player} between ${startDate.toISOString()} and ${endDate.toISOString()}`
  );

  const allEntries: SplHistory[] = [];
  let lastBlockNum: number | undefined;
  let hasMoreData = true;
  let iterationCount = 0;
  const maxIterations = 100; // Safety limit

  // Convert end date to approximate block number for starting point
  while (hasMoreData && iterationCount < maxIterations) {
    iterationCount++;

    try {
      // Add delay between requests (except first request)
      if (iterationCount > 1) {
        await new Promise(resolve => setTimeout(resolve, DEFAULT_DELAY_MS));
      }

      logger.debug(
        `History fetch iteration ${iterationCount} for ${player}, before_block: ${lastBlockNum}`
      );

      const batch = await fetchPlayerHistory(player, decryptedToken, types, lastBlockNum);

      if (batch.length === 0) {
        hasMoreData = false;
        break;
      }

      // Filter entries by date range
      const filteredBatch = batch.filter(entry => {
        const entryDate = new Date(entry.created_date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      allEntries.push(...filteredBatch);

      // Check if we've gone past our start date
      const oldestEntry = batch[batch.length - 1];
      const oldestDate = new Date(oldestEntry.created_date);

      if (oldestDate < startDate) {
        hasMoreData = false;
        break;
      }

      // Set up for next iteration
      lastBlockNum = oldestEntry.block_num - 1;

      // If we got less than the limit, we've reached the end
      if (batch.length < DEFAULT_LIMIT) {
        hasMoreData = false;
      }
    } catch (error) {
      logger.error(
        `Error in history fetch iteration ${iterationCount} for ${player}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      hasMoreData = false;
    }
  }

  // Sort by created_date descending (newest first) and remove failed entries

  const successfulEntries = allEntries
    .filter(entry => Boolean(entry.success))
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

  logger.debug(
    `Completed history fetch for ${player}: ${successfulEntries.length} / ${allEntries.length} entries in ${iterationCount} iterations`
  );

  return successfulEntries;
}
