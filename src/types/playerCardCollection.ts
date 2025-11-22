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
export type EditionValues = {
  [Key: number]: {
    marketValue: number;
    listValue: number;
    bcx: number;
    numberOfCards: number;
    numberOfSellableCards: number;
  };
};
