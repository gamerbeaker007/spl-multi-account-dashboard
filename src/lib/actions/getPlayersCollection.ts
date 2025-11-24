'use server';
import { fetchMarketPrices } from '@/lib/api/peakmonstersApi';
import logger from '@/lib/log/logger.server';
import { fetchCardCollection, fetchListingPrices } from '@/lib/api/splApi';
import { getPlayerCollectionValue } from '@/lib/collectionUtils';

// Server action for fetching player collection
export async function getPlayersCollection(users: string[]) {
  try {
    if (!users || !Array.isArray(users) || users.length === 0) {
      throw new Error('Users array is required');
    }

    logger.info(`Fetching collection information for users: ${users}`);

    const listPricing = await fetchListingPrices();
    const marketPricing = await fetchMarketPrices();

    const playerData = [];

    for (const user of users) {
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

        playerData.push({
          username: user,
          collectionPower: totalCollectionPower,
          playerCollectionValue,
        });
      } catch (userError) {
        logger.error(
          `Failed to fetch data for user ${user} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        playerData.push({
          username: user,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Successfully fetched collection data for all users ${users.length}`);

    return {
      players: playerData,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account collection action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
