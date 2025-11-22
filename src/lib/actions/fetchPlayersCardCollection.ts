'use server';
import { fetchMarketPrices } from '@/lib/api/peakmonstersApi';
import { fetchCardCollection, fetchListingPrices } from '@/lib/api/splApi';
import { getPlayerCollectionValue } from '@/lib/collectionUtils';
import logger from '@/lib/log/logger.server';
import { editionMap } from '@/types/card';
import { EditionValues, PlayerCardCollectionData } from '@/types/playerCardCollection';
import { SplPlayerCard } from '@/types/spl/card';
import { cacheLife } from 'next/cache';

function createEmptyEditionValues(): EditionValues {
  const editions = Object.keys(editionMap).map(Number) as (keyof typeof editionMap)[];
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
export async function fetchPlayersCardCollectionValue(
  user: string
): Promise<PlayerCardCollectionData> {
  'use cache';
  cacheLife('hours');

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

export async function fetchPlayerCardCollection(user: string): Promise<SplPlayerCard[]> {
  'use cache';
  cacheLife('hours');

  const playerCollection = await fetchCardCollection(user);

  return playerCollection.cards;
}
