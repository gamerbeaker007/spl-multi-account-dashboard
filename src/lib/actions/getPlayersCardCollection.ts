'use server';
import { fetchMarketPrices } from '@/lib/api/peakmonstersApi';
import { fetchCardCollection, fetchCardDetails, fetchListingPrices } from '@/lib/api/splApi';
import { getCardImg, getPlayerCollectionValue } from '@/lib/collectionUtils';
import logger from '@/lib/log/logger.server';
import {
  CardDetail,
  CardElement,
  CardFoil,
  cardFoilOptions,
  CardRarity,
  cardRarityOptions,
  CardRole,
  CardSetName,
  DetailedPlayerCardCollection,
  editionMap,
} from '@/types/card';
import { EditionValues, PlayerCardCollectionData } from '@/types/playerCardCollection';
import { SplCardCollection } from '@/types/spl/card';
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
export async function getPlayersCardCollectionValue(
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
      const playerCollection = await getPlayerCollection(user);
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

async function getPlayerCollection(user: string): Promise<SplCardCollection> {
  'use cache';
  cacheLife('hours');
  const playerCollection = await fetchCardCollection(user);
  return playerCollection;
}

export async function getDetailedPlayerCardCollection(
  user: string
): Promise<DetailedPlayerCardCollection> {
  'use cache';
  cacheLife('hours');

  const playerCollection = await getPlayerCollection(user);
  const cardDetails = await fetchCardDetails();

  const combinedCollection = cardDetails.reduce((acc, card) => {
    const cardDetailId = card.id;

    const playerCardSpl = playerCollection.cards.filter(pc => {
      return pc.card_detail_id === card.id;
    });

    const playerCards: CardDetail[] = playerCardSpl.map(pc => {
      const foil = cardFoilOptions[pc.foil] as CardFoil;
      const cardSet =
        (editionMap[pc.edition as keyof typeof editionMap]?.setName as CardSetName) || 'unknown';
      const cardImageUrl = getCardImg(card.name, pc.edition, foil, pc.level);
      const owner = pc.player;
      return {
        id: pc.card_detail_id,
        uid: pc.uid,
        name: card.name,
        owner: owner,
        xp: pc.xp,
        edition: pc.edition,
        cardSet: cardSet,
        collectionPower: pc.collection_power,
        bcx: pc.bcx,
        setId: pc.set_id,
        bcxUnbound: pc.bcx_unbound,
        foil: foil,
        mint: pc.mint,
        level: pc.level,
        imgUrl: cardImageUrl,
      };
    });

    const role = card.type === 'Summoner' ? 'archon' : ('unit' as CardRole);
    const color: CardElement = card.color as CardElement;
    const secondaryColor: CardElement | undefined = card.secondary_color
      ? (card.secondary_color as CardElement)
      : undefined;
    const rarity = cardRarityOptions[card.rarity - 1] as CardRarity;

    // Create a separate record for each edition
    const editions = card.editions.split(',').map(edition => parseInt(edition));
    editions.forEach(edition => {
      const key = `${cardDetailId}-${edition}`;

      // Filter player cards for this specific edition
      const editionCards = playerCards.filter(pc => pc.edition === edition);

      acc[key] = {
        cardDetailId: card.id,
        name: card.name,
        edition: edition,
        tier: card.tier,
        rarity: rarity,
        color: color,
        secondaryColor: secondaryColor,
        role: role,
        highestLevelCard:
          editionCards.length > 0
            ? editionCards.reduce((highest, current) => {
                return current.level > highest.level ? current : highest;
              })
            : undefined,
        allCards: editionCards.length > 0 ? editionCards : undefined,
      };
    });

    return acc;
  }, {} as DetailedPlayerCardCollection);

  return combinedCollection;
}
