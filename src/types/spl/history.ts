// Base structure for all history entries
export interface SplHistory {
  id: string;
  block_id: string;
  prev_block_id: string;
  type: string;
  player: string;
  affected_player: string;
  data: string; // JSON string that varies by type
  success: boolean;
  error: string | null;
  block_num: number;
  created_date: string;
  result: string | null; // JSON string that varies by type, can be null on failure
  steem_price: number | null;
  sbd_price: number | null;
  is_owner: boolean;
}
