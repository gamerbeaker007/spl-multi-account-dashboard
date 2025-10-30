export interface SplLeagueInfo {
  rank: number | null;
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
  guild_data: string;
  avatar_id: number;
  display_name: string | null;
  title_pre: string;
  title_post: string;
  rshares: number;
  reward_chest_qty: number | null;
  leaderboard: string;
}

export interface SplGuildInfo {
    id: string;
    name: string;
    brawl_status: number;
    brawl_level: number;
    tournament_id: string;
    join_date: string;
    tournament_status: number;
  }

export interface SplPlayerDetails {
  name: string;
  join_date: string;
  rating: number;
  battles: number;
  wins: number;
  current_streak: number;
  longest_streak: number;
  max_rating: number;
  max_rank: number;
  champion_points: number;
  guild: SplGuildInfo | null
  avatar_id: number;
  display_name: string | null;
  title_pre: string;
  title_post: string;
  collection_power: number;
  modern_rating: number;
  modern_battles: number;
  modern_wins: number;
  modern_current_streak: number;
  modern_longest_streak: number;
  modern_max_rating: number;
  modern_max_rank: number;
  modern_league: number;
  modern_adv_msg_sent: boolean;
  survival_rating: number;
  survival_battles: number;
  survival_wins: number;
  survival_current_streak: number;
  survival_longest_streak: number;
  survival_max_rating: number;
  survival_max_rank: number;
  survival_league: number;
  survival_adv_msg_sent: boolean;
  foundation_rating: number;
  foundation_battles: number;
  foundation_wins: number;
  foundation_current_streak: number;
  foundation_longest_streak: number;
  foundation_max_rating: number;
  foundation_max_rank: number;
  foundation_league: number;
  foundation_adv_msg_sent: boolean;
  player_uuid: string;
  season_pass: 1;
  season_details: {
    survival: SplLeagueInfo | null;
    foundation: SplLeagueInfo | null;
    wild: SplLeagueInfo | null;
    modern: SplLeagueInfo | null;
  }
}
