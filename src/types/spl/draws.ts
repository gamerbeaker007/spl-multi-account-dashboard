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

/** A single prize winner from /ranked_draws/recent_prizes or /frontier_draws/recent_prizes, enriched with foil */
export type SplDrawRecentWinner = {
  uid: string;
  card_detail_id: number;
  xp: number;
  gold: boolean;
  mint: string;
  mint_player: string | null;
  mint_date: string | null;
  mint_block: number | null;
  mint_tx: string | null;
  guild_name: string | null;
  player_avatar: string | null;
  foil: number;
};
