export type PeakmonstersMarketPrices = {
  prices: PeakmonstersMarketPriceEntry[];
};
export type PeakmonstersMarketPriceEntry = {
  id: number;
  card_detail_id: number;
  edition: number;
  gold: boolean;
  foil: number;
  last_bcx_price: number;
  last_sell_price: number;
  last_bcx: string;
  last_block_num: string;
  prev_bcx_price: number;
  prev_sell_price: number;
  prev_bcx: string;
  prev_block_num: string;
};
