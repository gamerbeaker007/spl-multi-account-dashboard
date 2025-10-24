export interface SplBalance {
  player: string;
  token: string;
  balance: number;
  last_update_date: Date;
  last_reward_block: number | string; // strange should be number only for FECR its a timestamp
  last_reward_time: string;
}
