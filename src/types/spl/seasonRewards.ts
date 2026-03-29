export interface SplSeasonRewardInfo {
  season: number;
  wild_glint: number | null;
  modern_glint: number | null;
  survival_glint: number | null;
  foundation_glint: number | null;
}

export interface SPLSeasonRewards {
  season_reward_info: SplSeasonRewardInfo;
}
