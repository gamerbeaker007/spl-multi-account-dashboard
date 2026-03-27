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

export type SplCompletedDrawVerificationData = {
  trx_id: string;
  block_id: string;
  block_num: number;
  block_time: string;
  prev_block_id: string;
};

export type SplCompletedDraw = {
  id: number;
  end_date: string;
  total_entries: number;
  player_entries: number;
  verification_data: SplCompletedDrawVerificationData | null;
  draw_number: number;
};

export type SplCompletedDrawsResponse = {
  draws: SplCompletedDraw[];
};

export type SplDrawEntry = {
  player: string;
  entries: number;
  last_update_date: string;
};

export type SplDrawPrize = {
  card_detail_id: number;
  card_xp: number;
  card_edition: number;
  card_tier: number;
  card_foil: number;
  card_uid: string;
  card_mint: string;
};

export type SplDrawWinner = {
  player: string;
  entries: number;
  prize: SplDrawPrize;
};
