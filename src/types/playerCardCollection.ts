import { EDITION_MAPPING } from '@/lib/staticsIconUrls';

export interface PlayerCardCollectionData {
  username: string;
  date: string;
  collectionPower: number;
  playerCollectionValue: PlayerCollectionValue;
  error?: string;
}

export interface PlayerCollectionValue {
  player: string;
  totalListValue: number;
  totalMarketValue: number;
  totalBcx: number;
  totalNumberOfCards: number;
  totalSellableCards: number;
  editionValues: EditionValues;
}
// Edition type based on the mapping keys
export type Edition = keyof typeof EDITION_MAPPING;

export type EditionValues = {
  [Key in Edition]: {
    marketValue: number;
    listValue: number;
    bcx: number;
    numberOfCards: number;
    numberOfSellableCards: number;
  };
};
