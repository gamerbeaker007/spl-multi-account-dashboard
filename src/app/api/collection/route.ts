import { fetchMarketPrices } from '@/lib/api/peakmonstersApi';
import { fetchCardCollection, fetchListingPrices } from '@/lib/api/splApi';
import { getPlayerCollectionValue } from '@/lib/collectionUtils';
import logger from '@/lib/log/logger.server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // array with users as input
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
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
          `Failed to fetch data for user ${user.username} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        // Continue processing other users even if one fails
        playerData.push({
          username: user.username,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Successfully fetched collection data for all users ${users.length}`);
    return NextResponse.json({
      players: playerData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account status API error: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
