export interface SplBrawlPlayerDetails {
  total_battles: number;
  entered_battles: number;
  player: string;
  join_date: string;
  wins: number;
  auto_wins: number;
  losses: number;
  draws: number;
  meta_pts: number;
  meta_pts_float: number;
  defeated: number;
  fray_index: number;
  brawl_level: number;
}

export interface SplFraysDetails {
  cycle: number;
  tournament_id: string;
  guild_id: string;
  index: number;
  player: string;
  brawl_level: number;
  guild_join_date: string;
  auto_wins: number;
  avatar_id: number;
  rank: number;
}

export interface SplBrawlDetails {
  id: string;
  format: string;
  sub_format: string;
  start_date: string;
  status: number;
  players: SplBrawlPlayerDetails[];
  total_battles: number;
  completed_battles: number;
  frays: SplFraysDetails[];
}
