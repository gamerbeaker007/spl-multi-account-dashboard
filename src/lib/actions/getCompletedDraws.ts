'use server';

import {
  fetchFrontierCompletedDraws,
  fetchFrontierDrawEntries,
  fetchFrontierRecentPrizes,
  fetchRankedCompletedDraws,
  fetchRankedDrawEntries,
  fetchRankedRecentPrizes,
} from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { SplCompletedDraw, SplDrawEntry, SplDrawRecentWinner } from '@/types/spl/draws';
import { getCardDetails } from './getCardDetails';

export interface CompletedDrawResult {
  latestDraw: SplCompletedDraw;
  entries: SplDrawEntry[];
  /** Winners from the most recent draw date across foil types 2, 3 and 4 */
  recentWinners: SplDrawRecentWinner[];
  cardDetails: SplCardDetail[];
}

const DRAW_FOILS = [2, 3, 4];

async function fetchRecentWinners(
  fetchFn: (foil: number) => Promise<SplDrawRecentWinner[]>,
  drawEndDate: string
): Promise<SplDrawRecentWinner[]> {
  const results = await Promise.allSettled(DRAW_FOILS.map(fetchFn));

  const combined: SplDrawRecentWinner[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') combined.push(...result.value);
  });

  // Filter to winners whose mint_date matches the draw's end_date (date portion, UTC)
  const drawDate = drawEndDate.slice(0, 10);
  return combined.filter(w => w.mint_date?.slice(0, 10) === drawDate);
}

export async function getCompletedDrawResult(
  type: 'frontier' | 'ranked'
): Promise<CompletedDrawResult> {
  logger.info(`Fetching completed ${type} draw data`);

  const [drawsResponse, cardDetails] = await Promise.all([
    type === 'frontier' ? fetchFrontierCompletedDraws() : fetchRankedCompletedDraws(),
    getCardDetails(),
  ]);

  const latestDraw = drawsResponse.draws[0];
  if (!latestDraw) throw new Error(`No completed ${type} draws found`);

  const [entries, recentWinners] = await Promise.all([
    type === 'frontier'
      ? fetchFrontierDrawEntries(latestDraw.id)
      : fetchRankedDrawEntries(latestDraw.id),
    fetchRecentWinners(
      type === 'frontier' ? fetchFrontierRecentPrizes : fetchRankedRecentPrizes,
      latestDraw.end_date
    ),
  ]);

  logger.info(
    `${type} draw #${latestDraw.draw_number}: ${entries.length} entries, ${recentWinners.length} recent winners`
  );

  return { latestDraw, entries, recentWinners, cardDetails };
}
