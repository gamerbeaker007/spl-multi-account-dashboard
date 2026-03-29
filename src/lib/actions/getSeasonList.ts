'use server';

import { fetchCurrentSeason, fetchSeasonEndDate } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplSeasonInfo } from '@/types/spl/season';

const BATCH_SIZE = 20;

// Server-side in-memory cache — survives across requests in the same Node.js process.
// Re-fetches only when a new season starts (current season ID changes).
let cachedSeasonId: number | null = null;
let cachedSeasons: SplSeasonInfo[] = [];

async function fetchAllSeasons(currentId: number): Promise<SplSeasonInfo[]> {
  const seasons: SplSeasonInfo[] = [];
  let batchStart = currentId;

  while (batchStart > 0) {
    const ids = Array.from({ length: Math.min(BATCH_SIZE, batchStart) }, (_, i) => batchStart - i);
    const batch = await Promise.all(ids.map(id => fetchSeasonEndDate(id).catch(() => null)));

    for (const season of batch) {
      if (season) seasons.push(season);
    }

    batchStart -= BATCH_SIZE;
  }

  return seasons.sort((a, b) => b.id - a.id);
}

/**
 * Fetch all seasons from the current season down to season 1.
 * Results are cached in server memory and only re-fetched when the current
 * season ID changes (i.e. a new season has started).
 * Returns newest-first.
 */
export async function getAllSeasons(): Promise<SplSeasonInfo[]> {
  const current = await fetchCurrentSeason();

  if (cachedSeasonId === current.id && cachedSeasons.length > 0) {
    logger.debug(
      `getAllSeasons: returning cached ${cachedSeasons.length} seasons (season ${current.id})`
    );
    return cachedSeasons;
  }

  logger.info(
    `getAllSeasons: cache miss (prev=${cachedSeasonId}, current=${current.id}) — fetching all seasons`
  );
  const seasons = await fetchAllSeasons(current.id);

  cachedSeasonId = current.id;
  cachedSeasons = seasons;

  logger.info(`getAllSeasons: cached ${seasons.length} seasons (current: ${current.id})`);
  return seasons;
}
