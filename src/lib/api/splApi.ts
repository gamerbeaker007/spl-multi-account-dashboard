import {
  ClaimDailyData,
  ClaimDailyResult,
  ClaimDailyResultReward,
  ClaimLeagueRewardData,
  ClaimLeagueRewardResult,
  ParsedHistory,
  PurchaseData,
  PurchaseResult,
  purchaseTypes,
  RankedDrawEntry,
  RewardDraw,
  RewardMerits,
} from '@/types/parsedHistory';
import { SplLoginResponse } from '@/types/spl/auth';
import {
  BalanceHistoryTokenType,
  SplBalanceHistoryItem,
  SplUnclaimedBalanceHistoryItem,
  UnclaimedTokenType,
} from '@/types/spl/balanceHistory';
import { SplBalance } from '@/types/spl/balances';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { SplCardCollection } from '@/types/spl/card';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { SplDailyProgress } from '@/types/spl/dailies';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { SplFormat } from '@/types/spl/format';
import { SplHistory } from '@/types/spl/history';
import { SplCardListingPriceEntry } from '@/types/spl/market';
import { SplSeasonInfo as SplSeasonEndDate } from '@/types/spl/season';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import axios from 'axios';
import * as rax from 'retry-axios';
import { validateSplJwt } from '../auth/jwt/splJwtValidation';
import logger from '../log/logger.server';

const splBaseClient = axios.create({
  baseURL: 'https://api.splinterlands.com',
  timeout: 5000,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'User-Agent': 'SPL-Data/1.0',
  },
});

rax.attach(splBaseClient);
splBaseClient.defaults.raxConfig = {
  retry: 1,
  retryDelay: 0,
  backoffType: 'static',
  statusCodesToRetry: [
    [429, 429],
    [500, 599],
  ],
  onRetryAttempt: async err => {
    const cfg = rax.getConfig(err);
    const attempt = cfg?.currentRetryAttempt ?? 1;
    // Short jitter to stay within Vercel free-tier 10s limit
    const delay = Math.random() * Math.min(500, 250 * 2 ** attempt);
    logger.warn(`Retry attempt #${attempt}, jitter delay ${Math.round(delay)}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  },
};

// Valid purchase types we want to include
const VALID_PURCHASE_TYPES: purchaseTypes[] = [
  'reward_merits',
  'reward_draw',
  'ranked_draw_entry',
  'potion',
  'unbind_scroll',
];

/**
 * Parse raw SplHistory entry into typed ParsedHistory
 */
function parseHistoryToInternalTypes(entry: SplHistory): ParsedHistory | null {
  try {
    let parsedData: ClaimLeagueRewardData | ClaimDailyData | PurchaseData;
    let parsedResult: ClaimLeagueRewardResult | ClaimDailyResult | PurchaseResult | null = null;

    // Parse data field based on type
    if (entry.type === 'claim_reward') {
      parsedData = JSON.parse(entry.data) as ClaimLeagueRewardData;
      if (entry.result) {
        parsedResult = JSON.parse(entry.result) as ClaimLeagueRewardResult;
      }
    } else if (entry.type === 'claim_daily') {
      parsedData = JSON.parse(entry.data) as ClaimDailyData;
      if (entry.result) {
        parsedResult = JSON.parse(entry.result) as ClaimDailyResult;
        // The quest_data.rewards field is a JSON string, not an object - parse it
        parsedResult.quest_data.rewards = JSON.parse(
          parsedResult.quest_data.rewards as unknown as string
        ) as ClaimDailyResultReward;
      }
    } else if (entry.type === 'purchase') {
      parsedData = JSON.parse(entry.data) as PurchaseData;

      // Skip purchases that are not in our valid list
      if (!VALID_PURCHASE_TYPES.includes(parsedData.type)) {
        logger.debug(`Skipping purchase type: ${parsedData.type}`);
        return null;
      }

      if (entry.result) {
        parsedResult = JSON.parse(entry.result) as PurchaseResult;
        parsedResult.data = JSON.parse(parsedResult.data as unknown as string) as
          | RankedDrawEntry
          | RewardMerits
          | RewardDraw;
      }
    } else {
      logger.warn(`Unknown history entry type: ${entry.type}`);
      return null;
    }

    if (!parsedResult) {
      logger.debug(`No result for entry ${entry.id} - skipping`);
      return null;
    }

    return {
      id: entry.id,
      block_id: entry.block_id,
      prev_block_id: entry.prev_block_id,
      type: entry.type as 'claim_daily' | 'claim_reward' | 'purchase',
      player: entry.player,
      affected_player: entry.affected_player,
      data: parsedData,
      success: entry.success,
      error: entry.error,
      block_num: entry.block_num,
      created_date: entry.created_date,
      result: parsedResult,
      steem_price: entry.steem_price,
      sbd_price: entry.sbd_price,
      is_owner: entry.is_owner,
    };
  } catch (error) {
    logger.error(`Failed to parse history entry ${entry.id}: ${error}`);
    return null;
  }
}

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

//https://api2.splinterlands.com/players/current_rewards?username=beaker007
export async function fetchCurrentRewards(username: string): Promise<SPLSeasonRewards> {
  const url = '/players/current_rewards';
  logger.debug(`Fetching current rewards for user: ${username}`);

  try {
    const res = await splBaseClient.get(url, {
      params: { username },
    });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SPLSeasonRewards;
  } catch (error) {
    logger.error(
      `Failed to fetch current rewards: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

export async function splLogin(
  username: string,
  timestamp: number,
  signature: string
): Promise<SplLoginResponse> {
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
      const result = response.data as SplLoginResponse;

      return result as SplLoginResponse;
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

  if (!seasonId || seasonId < 1) {
    throw new Error(`Invalid seasonId: ${seasonId}. Season ID must be a positive integer.`);
  }

  try {
    // Fetch current season
    const currentSeason = await fetchSeasonEndDate(seasonId);
    // Season 1 has no previous season; use the Unix epoch as a safe start date
    const startDate =
      seasonId > 1 ? new Date((await fetchSeasonEndDate(seasonId - 1)).ends) : new Date(0);
    return { startDate, endDate: new Date(currentSeason.ends) };
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
export async function fetchSeasonEndDate(seasonId: number): Promise<SplSeasonEndDate> {
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

      return response.data as SplSeasonEndDate;
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

/** Fetch the current (active) season without needing an ID. */
export async function fetchCurrentSeason(): Promise<SplSeasonEndDate> {
  try {
    const response = await splBaseClient.get('/settings');
    if (response.status === 200 && response.data) {
      return {
        id: response.data.season.id,
        ends: response.data.season.ends,
      } as SplSeasonEndDate;
    }
    throw new Error('Current season request failed');
  } catch (error) {
    logger.error(
      `Failed to fetch current season: ${error instanceof Error ? error.message : 'Unknown error'}`
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

/**
 * Fetch brawl details from Splinterlands API
 */
//https://api.splinterlands.com/tournaments/find_brawl?guild_id=27ecd1f1e56bb890b0f420d13edeaf7f45991b16&id=GUILD-BC328-BL56-BRAWL2
export async function fetchBrawlDetails(
  guildId: string,
  trounamenetId: string,
  player: string,
  decryptedToken?: string
): Promise<SplBrawlDetails> {
  const url = '/tournaments/find_brawl';
  logger.debug('Fetching brawl details from Splinterlands API');

  const params = {
    guild_id: guildId,
    id: trounamenetId,
    username: player,
  };

  const headers = decryptedToken ? await getAuthorizationHeader(player, decryptedToken) : undefined;

  try {
    const res = await splBaseClient.get(url, { params, headers });
    const data = res.data;

    // Handle API-level error even if HTTP status is 200
    if (!data) {
      throw new Error('Invalid response from Splinterlands API: expected array');
    }

    return data as SplBrawlDetails;
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
 * Returns typed ParsedHistory with parsed data and result fields
 */
export async function fetchPlayerHistory(
  player: string,
  decryptedToken: string,
  types: string, // comma-separated list of types
  beforeBlock?: number
): Promise<ParsedHistory[]> {
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

      const rawHistory = response.data as SplHistory[];
      // Parse all entries to V2 format
      const parsedHistory = rawHistory
        .map(parseHistoryToInternalTypes)
        .filter((entry): entry is ParsedHistory => entry !== null); // Filter out nulls

      return parsedHistory as ParsedHistory[];
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

const DEFAULT_DELAY_MS = 100;
const DEFAULT_LIMIT = 500;
/**
 * Recursively fetch player history between two dates
 * Uses before_block parameter to paginate through results
 * Returns typed ParsedHistory with parsed data and result fields
 */
export async function fetchPlayerHistoryByDateRange(
  player: string,
  decryptedToken: string,
  types: string,
  startDate: Date,
  endDate: Date
): Promise<ParsedHistory[]> {
  logger.debug(
    `Fetching player history for ${player} between ${startDate.toISOString()} and ${endDate.toISOString()}`
  );

  const allEntries: ParsedHistory[] = [];
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

  // Sort by created_date descending (newest first) - entries are already filtered for success in parseToV2
  const sortedEntries = allEntries.sort(
    (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );

  logger.debug(
    `Completed history fetch for ${player}: ${sortedEntries.length} entries in ${iterationCount} iterations`
  );

  return sortedEntries;
}

const BALANCE_HISTORY_LIMIT = 1000;
const BALANCE_HISTORY_MAX_ITERATIONS = 200;

// https://api.splinterlands.com/players/balance_history?username=beaker007&token_type=GLINT&limit=50
/**
 * Fetch a single page of balance history for a token.
 * Pagination uses dual-cursor: `from` (created_date) + `last_update_date` from previous page's last item.
 */
export async function fetchBalanceHistoryPage(
  username: string,
  tokenType: BalanceHistoryTokenType,
  decryptedToken: string,
  fromDate?: string,
  lastUpdateDate?: string,
  limit: number = BALANCE_HISTORY_LIMIT
): Promise<SplBalanceHistoryItem[]> {
  const url = '/players/balance_history';

  const params: Record<string, string | number> = {
    username,
    token_type: tokenType,
    limit,
  };
  if (fromDate) params.from = fromDate;
  if (lastUpdateDate) params.last_update_date = lastUpdateDate;

  const headers = await getAuthorizationHeader(username, decryptedToken);

  try {
    const res = await splBaseClient.get(url, { params, headers });
    const data = res.data;

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data as SplBalanceHistoryItem[];
  } catch (error) {
    logger.error(
      `Failed to fetch balance history for ${username}/${tokenType}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Fetch all balance history for a token within a date range using dual-cursor pagination.
 * Uses `from` (created_date) and `last_update_date` from the last item of each page.
 */
export async function fetchBalanceHistoryByDateRange(
  username: string,
  tokenType: BalanceHistoryTokenType,
  decryptedToken: string,
  startDate: Date,
  endDate: Date
): Promise<SplBalanceHistoryItem[]> {
  logger.info(
    `Fetching balance history for ${username}/${tokenType} between ${startDate.toISOString()} and ${endDate.toISOString()}`
  );

  const allEntries: SplBalanceHistoryItem[] = [];
  // Start the cursor at endDate so we skip all history newer than the target window.
  // Without this, high-volume tokens like SPS would page through months of recent
  // entries before reaching the season window, easily hitting the iteration cap.
  let fromDate: string | undefined = endDate.toISOString();
  let lastUpdateDate: string | undefined;
  let iterationCount = 0;

  while (iterationCount < BALANCE_HISTORY_MAX_ITERATIONS) {
    iterationCount++;

    if (iterationCount > 1) {
      await new Promise(resolve => setTimeout(resolve, DEFAULT_DELAY_MS));
    }

    const batch = await fetchBalanceHistoryPage(
      username,
      tokenType,
      decryptedToken,
      fromDate,
      lastUpdateDate,
      BALANCE_HISTORY_LIMIT
    );

    if (batch.length === 0) break;

    // Filter entries within date range
    const filteredBatch = batch.filter(entry => {
      const entryDate = new Date(entry.created_date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    allEntries.push(...filteredBatch);

    // Update cursors from last item for next page
    const lastItem = batch[batch.length - 1];
    fromDate = lastItem.created_date;
    lastUpdateDate = lastItem.last_update_date;

    // Stop if oldest entry in batch is before our start date
    if (new Date(lastItem.created_date) < startDate) break;

    // Stop if we got less than limit (no more data)
    if (batch.length < BALANCE_HISTORY_LIMIT) break;
  }

  logger.info(
    `Fetched ${allEntries.length} balance history entries for ${username}/${tokenType} in ${iterationCount} iterations`
  );

  return allEntries;
}

// https://api.splinterlands.com/players/unclaimed_balance_history?username=beaker007&token_type=SPS,VOUCHER&limit=50
/**
 * Fetch a single page of unclaimed balance history.
 * Pagination uses id-based offset from previous page's last item.
 */
export async function fetchUnclaimedBalanceHistoryPage(
  username: string,
  tokenTypes: UnclaimedTokenType[],
  decryptedToken: string,
  offset?: string,
  limit: number = BALANCE_HISTORY_LIMIT
): Promise<SplUnclaimedBalanceHistoryItem[]> {
  const url = '/players/unclaimed_balance_history';

  const params: Record<string, string | number> = {
    username,
    token_type: tokenTypes.join(','),
    limit,
  };
  if (offset) params.offset = offset;

  const headers = await getAuthorizationHeader(username, decryptedToken);

  try {
    const res = await splBaseClient.get(url, { params, headers });
    const data = res.data;

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data as SplUnclaimedBalanceHistoryItem[];
  } catch (error) {
    logger.error(
      `Failed to fetch unclaimed balance history for ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Fetch all unclaimed balance history within a date range using id-based offset pagination.
 */
export async function fetchUnclaimedBalanceHistoryByDateRange(
  username: string,
  tokenTypes: UnclaimedTokenType[],
  decryptedToken: string,
  startDate: Date,
  endDate: Date
): Promise<SplUnclaimedBalanceHistoryItem[]> {
  logger.info(
    `Fetching unclaimed balance history for ${username}/${tokenTypes.join(',')} between ${startDate.toISOString()} and ${endDate.toISOString()}`
  );

  const allEntries: SplUnclaimedBalanceHistoryItem[] = [];
  let offset: string | undefined;
  let iterationCount = 0;

  while (iterationCount < BALANCE_HISTORY_MAX_ITERATIONS) {
    iterationCount++;

    if (iterationCount > 1) {
      await new Promise(resolve => setTimeout(resolve, DEFAULT_DELAY_MS));
    }

    const batch = await fetchUnclaimedBalanceHistoryPage(
      username,
      tokenTypes,
      decryptedToken,
      offset,
      BALANCE_HISTORY_LIMIT
    );

    if (batch.length === 0) break;

    // Filter entries within date range
    const filteredBatch = batch.filter(entry => {
      const entryDate = new Date(entry.created_date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    allEntries.push(...filteredBatch);

    // Update offset from last item's id for next page
    const lastItem = batch[batch.length - 1];
    offset = lastItem.id;

    // Stop if oldest entry in batch is before our start date
    if (new Date(lastItem.created_date) < startDate) break;

    // Stop if we got less than limit (no more data)
    if (batch.length < BALANCE_HISTORY_LIMIT) break;
  }

  logger.info(
    `Fetched ${allEntries.length} unclaimed balance history entries for ${username} in ${iterationCount} iterations`
  );

  return allEntries;
}
