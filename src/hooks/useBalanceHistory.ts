import {
  getSeasonDates,
  getTokenBalanceSummary,
  getUnclaimedSummaries,
} from '@/lib/actions/getTokenBalance';
import {
  BalanceHistoryTokenType,
  SeasonBalanceHistory,
  TokenBalanceSummary,
} from '@/types/spl/balanceHistory';
import { useCallback, useState } from 'react';

// other options possible: 'SPSP', 'SPSP-IN', 'SPSP-OUT'
const BALANCE_TOKENS = ['GLINT', 'DEC', 'MERITS', 'VOUCHER', 'SPS'];
const UNCLAIMED_TOKENS = ['UNCLAIMED_SPS', 'UNCLAIMED_VOUCHER'];
const ALL_TOKEN_KEYS = [...BALANCE_TOKENS, ...UNCLAIMED_TOKENS];

export type TokenFetchStatus = 'pending' | 'fetching' | 'done' | 'error';

export interface TokenProgress {
  token: string;
  status: TokenFetchStatus;
  errorMessage?: string;
}

interface UseBalanceHistoryState {
  isLoading: boolean;
  error: string | null;
  balanceHistory: SeasonBalanceHistory | null;
  progress: TokenProgress[];
}

interface UseBalanceHistoryReturn extends UseBalanceHistoryState {
  fetchBalanceHistory: (username: string, token: string, seasonId: number) => Promise<void>;
  clearBalanceHistory: () => void;
  clearError: () => void;
}

const emptyState: UseBalanceHistoryState = {
  isLoading: false,
  error: null,
  balanceHistory: null,
  progress: [],
};

export function useBalanceHistory(): UseBalanceHistoryReturn {
  const [state, setState] = useState<UseBalanceHistoryState>(emptyState);

  const fetchBalanceHistory = useCallback(
    async (username: string, encryptedToken: string, seasonId: number) => {
      // Initialize progress — all tokens pending
      setState({
        ...emptyState,
        isLoading: true,
        progress: ALL_TOKEN_KEYS.map(t => ({ token: t, status: 'pending' })),
      });

      try {
        // Get season date range + spillover window
        const { start, end, spilloverEnd } = await getSeasonDates(seasonId);

        // Mark all tokens as fetching immediately before parallel fetch
        setState(prev => ({
          ...prev,
          progress: prev.progress.map(p => ({ ...p, status: 'fetching' as TokenFetchStatus })),
        }));

        // Fetch all balance tokens in parallel — each updates its own progress on completion
        const balancePromises = BALANCE_TOKENS.map(
          async (token): Promise<TokenBalanceSummary | null> => {
            try {
              const summary = await getTokenBalanceSummary(
                username,
                encryptedToken,
                token as BalanceHistoryTokenType,
                start,
                end,
                spilloverEnd
              );
              setState(prev => ({
                ...prev,
                progress: prev.progress.map(p =>
                  p.token === token ? { ...p, status: 'done' } : p
                ),
              }));
              return summary;
            } catch (tokenErr) {
              setState(prev => ({
                ...prev,
                progress: prev.progress.map(p =>
                  p.token === token
                    ? {
                        ...p,
                        status: 'error',
                        errorMessage: tokenErr instanceof Error ? tokenErr.message : 'Error',
                      }
                    : p
                ),
              }));
              return null;
            }
          }
        );

        // Fetch unclaimed SPS + VOUCHER in parallel with balance tokens
        const unclaimedPromise: Promise<TokenBalanceSummary[]> = getUnclaimedSummaries(
          username,
          encryptedToken,
          start,
          end,
          spilloverEnd,
          seasonId
        )
          .then(summaries => {
            setState(prev => ({
              ...prev,
              progress: prev.progress.map(p =>
                UNCLAIMED_TOKENS.includes(p.token) ? { ...p, status: 'done' } : p
              ),
            }));
            return summaries;
          })
          .catch((unclaimedErr: unknown) => {
            setState(prev => ({
              ...prev,
              progress: prev.progress.map(p =>
                UNCLAIMED_TOKENS.includes(p.token)
                  ? {
                      ...p,
                      status: 'error',
                      errorMessage: unclaimedErr instanceof Error ? unclaimedErr.message : 'Error',
                    }
                  : p
              ),
            }));
            return [];
          });

        // Wait for all fetches to complete in parallel
        const [balanceResults, unclaimedSummaries] = await Promise.all([
          Promise.all(balancePromises),
          unclaimedPromise,
        ]);

        const summaries = balanceResults.filter((s): s is TokenBalanceSummary => s !== null);

        setState(prev => ({
          ...prev,
          isLoading: false,
          balanceHistory: {
            username,
            seasonId,
            dateRange: { start, end },
            balanceHistory: summaries,
            unclaimedHistory: unclaimedSummaries,
          },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    },
    []
  );

  const clearBalanceHistory = useCallback(() => {
    setState(emptyState);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchBalanceHistory,
    clearBalanceHistory,
    clearError,
  };
}
