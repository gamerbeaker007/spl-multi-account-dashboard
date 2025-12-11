'use server';

import { fetchPlayerHistoryByDateRange } from '@/lib/api/splApi';
import { getUserTokenCookie } from '@/lib/auth/cookies';
import logger from '@/lib/log/logger.server';
import { PackCard, PackData, PackResult } from '@/types/parsedHistory';
import { cacheLife } from 'next/cache';

export interface PackCardGroupKey {
  edition: number;
  card_detail_id: number;
  foil: number;
}

export interface PackCardCount extends PackCardGroupKey {
  count: number;
  rarity: number;
}

export interface EditionRarityStats {
  [foil: number]: number; // foil -> count
}

export interface EditionStats {
  edition: number;
  totalPacks: number;
  totalCards: number;
  rarities: {
    [rarity: number]: EditionRarityStats;
  };
}

export interface PackHistoryResult {
  firstOpenDate: string | null;
  lastOpenDate: string | null;
  cardCounts: PackCardCount[];
  editionStats: EditionStats[];
  totalCards: number;
}

export async function getPlayerPackHistory(player: string, days: number): Promise<PackHistoryResult> {
  if (!player) {
    throw new Error('Missing required parameter: player');
  }

  if (days <= 0) {
    throw new Error('Days must be greater than 0');
  }

  // Fetch token from cookies BEFORE cache scope
  const encryptedToken = await getUserTokenCookie(player);

  if (!encryptedToken) {
    throw new Error(`No token found for player: ${player}. Please login first.`);
  }

  return await getPlayerPackHistoryCached(player, days, encryptedToken);
}

async function getPlayerPackHistoryCached(
  player: string,
  days: number,
  encryptedToken: string
): Promise<PackHistoryResult> {
  'use cache';
  cacheLife('minutes');

  try {
    logger.info(`Fetching pack history for player: ${player} for last ${days} days`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch pack opening history (open_pack and open_all types)
    const packHistory = await fetchPlayerHistoryByDateRange(
      player,
      'open_pack,open_all',
      startDate,
      endDate,
      encryptedToken
    );

    logger.info(`Found ${packHistory.length} pack opening entries for ${player}`);

    // Extract all cards from pack openings
    const allCards: PackCard[] = [];
    const totalPacks: Record<number, number> = {};
    for (const entry of packHistory) {
      const result = entry.result as PackResult;
      const data = entry.data as PackData;
      totalPacks[data.edition] = (totalPacks[data.edition] || 0) + data.qty;
      if (result && 'cards' in result && Array.isArray(result.cards)) {
        allCards.push(...result.cards);
      }
    }

    logger.info(`Total cards from packs: ${allCards.length}`);

    // Load card details to get rarity information
    const { fetchCardDetails } = await import('@/lib/api/splApi');
    const cardDetails = await fetchCardDetails();
    const cardDetailsMap = new Map(cardDetails.map(card => [card.id, card]));

    // Group cards by edition, detail_id, and foil
    const cardGroups = new Map<string, PackCardCount>();

    for (const card of allCards) {
      const key = `${card.edition}_${card.card_detail_id}_${card.foil}`;
      const cardDetail = cardDetailsMap.get(card.card_detail_id);
      const rarity = cardDetail?.rarity ?? 0;

      if (cardGroups.has(key)) {
        cardGroups.get(key)!.count++;
      } else {
        cardGroups.set(key, {
          edition: card.edition,
          card_detail_id: card.card_detail_id,
          foil: card.foil,
          count: 1,
          rarity,
        });
      }
    }

    const cardCounts = Array.from(cardGroups.values());

    // Calculate edition statistics
    const editionMap = new Map<number, EditionStats>();

    for (const cardCount of cardCounts) {
      if (!editionMap.has(cardCount.edition)) {
        editionMap.set(cardCount.edition, {
          edition: cardCount.edition,
          totalPacks: totalPacks[cardCount.edition] || 0,
          totalCards: 0,
          rarities: {},
        });
      }

      const editionStats = editionMap.get(cardCount.edition)!;
      editionStats.totalCards += cardCount.count;

      // Initialize rarity if not exists
      if (!editionStats.rarities[cardCount.rarity]) {
        editionStats.rarities[cardCount.rarity] = {};
      }

      // Initialize foil count if not exists
      if (!editionStats.rarities[cardCount.rarity][cardCount.foil]) {
        editionStats.rarities[cardCount.rarity][cardCount.foil] = 0;
      }

      // Add count
      editionStats.rarities[cardCount.rarity][cardCount.foil] += cardCount.count;
    }

    const editionStats = Array.from(editionMap.values()).sort((a, b) => b.edition - a.edition);

    return {
      firstOpenDate: packHistory.length > 0 ? packHistory[packHistory.length - 1].created_date : null,
      lastOpenDate: packHistory.length > 0 ? packHistory[0].created_date : null,
      cardCounts,
      editionStats,
      totalCards: allCards.length,
    };
  } catch (error) {
    logger.error(
      `Failed to fetch pack history: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}
