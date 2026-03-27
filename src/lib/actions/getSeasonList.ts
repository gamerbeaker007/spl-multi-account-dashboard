'use server';

import { fetchCurrentSeason, fetchSeasonInfo } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplSeasonInfo } from '@/types/spl/season';

const BATCH_SIZE = 20;

/**
 * Fetch all seasons from the current season down to season 1.
 * Fetched in parallel batches to minimise round-trips.
 * Returns newest-first.
 */
export async function getAllSeasons(): Promise<SplSeasonInfo[]> {
  const current = await fetchCurrentSeason();
  const seasons: SplSeasonInfo[] = [];
  let batchStart = current.id;

  while (batchStart > 0) {
    const ids = Array.from({ length: Math.min(BATCH_SIZE, batchStart) }, (_, i) => batchStart - i);
    const batch = await Promise.all(ids.map(id => fetchSeasonInfo(id).catch(() => null)));

    for (const season of batch) {
      if (season) seasons.push(season);
    }

    batchStart -= BATCH_SIZE;
  }

  logger.info(`getAllSeasons: fetched ${seasons.length} seasons (current: ${current.id})`);
  return seasons.sort((a, b) => b.id - a.id);
}
