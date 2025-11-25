import logger from '@/lib/log/logger.server';
import { CardFoil, cardFoilSuffixMap, editionMap } from '@/types/card';
import { PeakmonstersMarketPriceEntry } from '@/types/peakmonsters/market';
import { EditionValues, PlayerCollectionValue } from '@/types/playerCardCollection';
import {
  EnrichedCollectionCard as EnrichedPlayerCardCollection,
  SplCardCollection,
  SplPlayerCard,
} from '@/types/spl/card';
import { SplCardListingPriceEntry } from '@/types/spl/market';
import { WEB_URL } from './staticsIconUrls';

/**
 * Group cards by BCX to reduce processing time for identifying values
 * e.g.: 10 Baakjira's of 1 BCX become 1 row with a count of 10
 * if you have another Baakjira that is 11 BCX that will be other row with count 1,
 * because that will reflect in a different price
 *
 * @param cards - Array of collection cards
 * @returns Array of grouped cards with counts
 */
function groupBcx(cards: SplPlayerCard[]): EnrichedPlayerCardCollection[] {
  const grouped = new Map<string, EnrichedPlayerCardCollection & { count: number }>();

  cards.forEach(card => {
    const key = `${card.player}-${card.card_detail_id}-${card.xp}-${card.gold}-${card.edition}-${card.level}-${card.bcx}-${card.bcx_unbound}`;

    if (grouped.has(key)) {
      grouped.get(key)!.count += 1;
    } else {
      grouped.set(key, { ...card, count: 1 });
    }
  });

  return Array.from(grouped.values());
}

/**
 * Get card edition values for a player account
 * @param playerCollection - Player card collection from splinterlands API
 * @param listPrices - List price data from splinterlands API
 * @param marketPrices - Market price data from peakmonsters API
 * @returns Object containing edition values
 */
export async function getPlayerCollectionValue(
  playerCollection: SplCardCollection,
  listPrices: SplCardListingPriceEntry[],
  marketPrices: PeakmonstersMarketPriceEntry[]
): Promise<PlayerCollectionValue> {
  const account = playerCollection.player;
  const playerCards = playerCollection.cards;
  logger.debug(`Getting card values for account: ${account}`);

  const totalNumberOfCards = playerCards.length;
  const totalBcx = playerCards.reduce((total, card) => total + card.bcx, 0);

  // Remove cards that are not fully unbound as they cannot be sold
  const sellableCards = playerCards.filter(isCardSellable);
  const totalSellableCards = sellableCards.length;

  const result: PlayerCollectionValue = {
    player: account,
    totalListValue: 0,
    totalMarketValue: 0,
    totalBcx,
    totalNumberOfCards,
    totalSellableCards,
    editionValues: {} as EditionValues,
  };

  if (sellableCards.length > 0) {
    // Group all BCX and unbound cards
    const groupedCards = groupBcx(sellableCards);

    Object.keys(editionMap).forEach(editionKey => {
      const edition = parseInt(editionKey);

      const editionCards = groupedCards.filter(card => card.edition === edition);
      const collectionValue = getCollectionValue(editionCards, listPrices, marketPrices);

      result.editionValues[edition] = {
        listValue: collectionValue.listValue,
        marketValue: collectionValue.marketValue,
        bcx: playerCards
          .filter(card => card.edition === edition)
          .reduce((sum, card) => sum + card.bcx, 0),
        numberOfCards: playerCards.filter(card => card.edition === edition).length,
        numberOfSellableCards: sellableCards.filter(card => card.edition === edition).length,
      };
      result.totalMarketValue += collectionValue.marketValue;
      result.totalListValue += collectionValue.listValue;
    });
  }

  return result;
}

/**
 * Check if a card is sellable based on edition and bound status
 * @param collectionCard - Card to check
 * @returns True if card is sellable
 */
function isCardSellable(collectionCard: SplPlayerCard): boolean {
  if (collectionCard.edition === 6 || collectionCard.edition === 16) {
    return false; // Gladius and soulbound foundation cards are never sellable
  } else if ([10, 13].includes(collectionCard.edition)) {
    return collectionCard.bcx === collectionCard.bcx_unbound; // Sellable when fully unbound
  } else if (collectionCard.edition === 18 && collectionCard.foil === 0) {
    // Only regular foils need to be unbound
    return collectionCard.bcx === collectionCard.bcx_unbound;
  } else {
    return true; // All other editions are always sellable
  }
}

/**
 * Calculate the total value of a card collection
 * @param cards - Array of collection cards
 * @param listPrices - List price data
 * @param marketPrices - Market price data
 * @returns Object with list_value and market_value
 */
function getCollectionValue(
  cards: EnrichedPlayerCardCollection[],
  listPrices: SplCardListingPriceEntry[],
  marketPrices: PeakmonstersMarketPriceEntry[]
): { listValue: number; marketValue: number } {
  let totalListValue = 0;
  let totalMarketValue = 0;

  cards.forEach(collectionCard => {
    const bcx = collectionCard.bcx * collectionCard.count;

    if (isCardSellable(collectionCard)) {
      const listPrice = getListPrice(collectionCard, listPrices);
      if (listPrice) {
        totalListValue += bcx * listPrice;
      }

      const marketPrice = getMarketPrice(collectionCard, marketPrices, listPrice);
      if (marketPrice) {
        totalMarketValue += bcx * marketPrice;
      }

      if (!listPrice && !marketPrice) {
        // This would need to be implemented to get card details
        logger.warn(
          `Card with ID '${collectionCard.card_detail_id}' not found on the market (list/market), ignoring for collection value`
        );
      }
    }
  });

  return {
    listValue: totalListValue,
    marketValue: totalMarketValue,
  };
}

/**
 * Get the list price for a card
 * @param collectionCard - Card to find price for
 * @param listPrices - List price data
 * @returns List price or null if not found
 */
function getListPrice(
  collectionCard: EnrichedPlayerCardCollection,
  listPrices: SplCardListingPriceEntry[]
): number | null {
  const priceData = findCard(collectionCard, listPrices);
  if (priceData.length > 0) {
    const sorted = priceData.sort(
      (a, b) =>
        (a as SplCardListingPriceEntry).low_price_bcx -
        (b as SplCardListingPriceEntry).low_price_bcx
    );
    return (sorted[0] as SplCardListingPriceEntry).low_price_bcx;
  }
  return null;
}

/**
 * Get the market price for a card
 * @param collectionCard - Card to find price for
 * @param marketPrices - Market price data
 * @param listPrice - List price for comparison (optional)
 * @returns Market price or null if not found
 */
function getMarketPrice(
  collectionCard: EnrichedPlayerCardCollection,
  marketPrices: PeakmonstersMarketPriceEntry[],
  listPrice?: number | null
): number | null {
  const priceData = findCard(collectionCard, marketPrices);
  if (priceData.length > 0) {
    const sorted = priceData.sort(
      (a, b) =>
        (a as PeakmonstersMarketPriceEntry).last_bcx_price -
        (b as PeakmonstersMarketPriceEntry).last_bcx_price
    );
    const marketPrice = (sorted[0] as PeakmonstersMarketPriceEntry).last_bcx_price;
    if (listPrice) {
      return Math.min(marketPrice, listPrice);
    } else {
      return marketPrice;
    }
  }
  return null;
}

/**
 * Find a card in price data by matching card_detail_id, gold, and edition
 * @param collectionCard - Card to find
 * @param priceData - Price data to search in
 * @returns Filtered price data
 */
function findCard(
  collectionCard: EnrichedPlayerCardCollection,
  priceData: SplCardListingPriceEntry[] | PeakmonstersMarketPriceEntry[]
): (SplCardListingPriceEntry | PeakmonstersMarketPriceEntry)[] {
  return priceData.filter(
    price =>
      price.card_detail_id === collectionCard.card_detail_id &&
      price.gold === collectionCard.gold &&
      price.edition === collectionCard.edition
  );
}

export function getCardImg(
  cardName: string,
  editionId: number,
  foil: CardFoil,
  level?: number
): string {
  const suffix = cardFoilSuffixMap[foil];
  const baseCardUrl = `${WEB_URL}cards_by_level`;
  const safeCardName = encodeURIComponent(cardName.trim());
  const lvl = level && level > 1 ? level : 1;
  let editionName = editionMap[editionId as keyof typeof editionMap]?.urlName || 'unknown_edition';

  // Special case for Arena Fanatic others like RuinKeeper are place under conclave
  if (cardName === 'Arena Fanatic') editionName = 'extra';

  return `${baseCardUrl}/${editionName}/${safeCardName}_lv${lvl}${suffix}.png`;
}
