export type SplRankedDrawStatus = {
  current_ranked_draw: {
    id: number;
    end_date: string;
    total_entries: number;
    player_entries: number;
    player_has_pass: boolean;
  };
  first_unclaimed_ranked_draw: null | {
    id: number;
    end_date: string;
    total_entries: number;
    player_entries: number;
    player_has_pass: boolean;
  };
  remaining_pass_details: {
    remaining_draws: number;
    player_pass_count: number;
  };
};

export type SplFrontierDrawStatus = {
  current_frontier_draw: {
    id: number;
    end_date: string;
    total_entries: number;
    player_entries: number;
  };
  first_unclaimed_frontier_draw: null | {
    id: number;
    end_date: string;
    total_entries: number;
    player_entries: number;
  };
};
