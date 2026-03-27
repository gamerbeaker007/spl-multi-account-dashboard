'use server';

import {
  fetchFrontierAvailablePrizes,
  fetchFrontierCompletedDraws,
  fetchFrontierDrawEntries,
  fetchRankedAvailablePrizes,
  fetchRankedCompletedDraws,
  fetchRankedDrawEntries,
} from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import { computeDrawWinners } from '@/lib/drawWinners';
import logger from '@/lib/log/logger.server';
import { SplCompletedDraw, SplDrawEntry, SplDrawWinner } from '@/types/spl/draws';

export interface CompletedDrawResult {
  latestDraw: SplCompletedDraw;
  entries: SplDrawEntry[];
  winners: SplDrawWinner[];
}

export interface CompletedDrawsData {
  frontier: CompletedDrawResult;
  ranked: CompletedDrawResult;
}

const PRIZES_PER_FRONTIER_DRAW = 76;
// Ranked draws use the same cap logic; Splinterlands settings only exposes
// prizes_per_frontier_draw so we use the same default for ranked as well.
const PRIZES_PER_RANKED_DRAW = 76;

/**
 * Fetch last completed draws for both frontier and ranked, plus the full
 * entries list and computed winners for each latest draw.
 * If an authorized username + encrypted token are provided, player_entries
 * will be populated in the draw data.
 */
export async function getCompletedDraws(
  authorizedUsername?: string | null,
  encryptedToken?: string | null
): Promise<CompletedDrawsData> {
  logger.info('Fetching completed draws (frontier + ranked)');

  const decryptedToken =
    authorizedUsername && encryptedToken
      ? await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY!)
      : undefined;

  const [frontierDrawsResponse, rankedDrawsResponse] = await Promise.all([
    fetchFrontierCompletedDraws(authorizedUsername ?? undefined, decryptedToken),
    fetchRankedCompletedDraws(authorizedUsername ?? undefined, decryptedToken),
  ]);

  const latestFrontier = frontierDrawsResponse.draws[0];
  const latestRanked = rankedDrawsResponse.draws[0];

  if (!latestFrontier || !latestRanked) {
    throw new Error('No completed draws found');
  }

  const frontierBlockTime = latestFrontier.verification_data?.block_time ?? latestFrontier.end_date;
  const rankedBlockTime = latestRanked.verification_data?.block_time ?? latestRanked.end_date;

  const [frontierEntries, frontierPrizes, rankedEntries, rankedPrizes] = await Promise.all([
    fetchFrontierDrawEntries(latestFrontier.id),
    fetchFrontierAvailablePrizes(frontierBlockTime),
    fetchRankedDrawEntries(latestRanked.id),
    fetchRankedAvailablePrizes(rankedBlockTime),
  ]);

  const frontierWinners =
    latestFrontier.verification_data
      ? computeDrawWinners(frontierPrizes, frontierEntries, latestFrontier.verification_data, PRIZES_PER_FRONTIER_DRAW)
      : [];

  const rankedWinners =
    latestRanked.verification_data
      ? computeDrawWinners(rankedPrizes, rankedEntries, latestRanked.verification_data, PRIZES_PER_RANKED_DRAW)
      : [];

  logger.info(
    `Computed winners: frontier #${latestFrontier.draw_number} → ${frontierWinners.length} winners, ranked #${latestRanked.draw_number} → ${rankedWinners.length} winners`
  );

  return {
    frontier: { latestDraw: latestFrontier, entries: frontierEntries, winners: frontierWinners },
    ranked: { latestDraw: latestRanked, entries: rankedEntries, winners: rankedWinners },
  };
}
