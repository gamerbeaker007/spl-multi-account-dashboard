'use server';
import { fetchMarketPrices } from '@/lib/api/peakmonstersApi';
import logger from '@/lib/log/logger.server';
import { fetchCardCollection, fetchListingPrices } from '@/lib/api/splApi';
import { getPlayerCollectionValue } from '@/lib/collectionUtils';
import { EDITION_MAPPING } from '@/lib/staticsIconUrls';
import { EditionValues, PlayerCardCollectionData } from '@/types/playerCardCollection';
import { cacheLife } from 'next/cache';

function createEmptyEditionValues(): EditionValues {
  const editions = Object.keys(EDITION_MAPPING).map(Number) as (keyof typeof EDITION_MAPPING)[];
  return editions.reduce((acc, edition) => {
    acc[edition] = {
      marketValue: 0,
      listValue: 0,
      bcx: 0,
      numberOfCards: 0,
      numberOfSellableCards: 0,
    };
    return acc;
  }, {} as EditionValues);
}

// Server action for fetching player collection
export async function fetchPlayersCardCollection(user: string): Promise<PlayerCardCollectionData> {
  'use cache';
  cacheLife('playerCardCollection');

  try {
    logger.info(`Fetching collection information for users: ${user}`);

    const listPricing = await fetchListingPrices();
    const marketPricing = await fetchMarketPrices();

    let playerData: PlayerCardCollectionData = {
      username: user,
      collectionPower: 0,
      playerCollectionValue: {
        player: user,
        totalListValue: 0,
        totalMarketValue: 0,
        totalBcx: 0,
        totalNumberOfCards: 0,
        totalSellableCards: 0,
        editionValues: createEmptyEditionValues(),
      },
      date: new Date().toISOString(),
    };

    try {
      const playerCollection = await fetchCardCollection(user);

      const totalCollectionPower = playerCollection.cards.reduce(
        (total, card) => total + card.collection_power || 0,
        0
      );

      const playerCollectionValue = await getPlayerCollectionValue(
        playerCollection,
        listPricing,
        marketPricing
      );

      playerData = {
        ...playerData,
        collectionPower: totalCollectionPower,
        playerCollectionValue,
      };
    } catch (userError) {
      logger.error(
        `Failed to fetch data for user ${user} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
      );
      playerData = {
        ...playerData,
        error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
      };
    }

    logger.info(`Successfully fetched collection data for user ${user}`);

    return playerData;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account collection action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
