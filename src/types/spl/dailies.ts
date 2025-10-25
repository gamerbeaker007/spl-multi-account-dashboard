export interface SplDailyProgress {
  total_wins: number;
  total_wins_to_next: number;
  wins_to_next: number;
  rewards_earned: number;
  rewards_ready_to_claim: number;
  end_date: string;
  current_rewards: {
    max_ranked_entries: number;
  };
}
