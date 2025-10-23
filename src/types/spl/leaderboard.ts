export interface SplLeaderboardPlayer {
  rank: number;
  season: number;
  player: string;
  rating: number;
  battles: number;
  wins: number;
  longest_streak: number;
  max_rating: number;
  league: number;
  max_league: number;
  reward_claim_tx: string | null;
  guild_id: string;
  guild_name: string;
  guild_data: string; // JSON string containing guild crest info
  avatar_id: number;
  display_name: string | null;
  title_pre: string | null;
  title_post: string | null;
  rshares?: number; // Only present on player object
  reward_chest_qty?: number | null; // Only present on player object
  leaderboard?: string; // Only present on player object
}

export interface SplLeaderboardResponse {
  player: SplLeaderboardPlayer;
  leaderboard: SplLeaderboardPlayer[];
}
