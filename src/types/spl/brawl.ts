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
export interface SplBrawlDetails {
  id: string;
  format: string;
  sub_format: string;
  start_date: string;
  status: number;
  players: SplBrawlPlayerDetails[];
  total_battles: number;
  completed_battles: number;
}
