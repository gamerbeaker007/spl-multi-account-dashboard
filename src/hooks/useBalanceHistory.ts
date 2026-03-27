import {
  getSeasonDates,
  getTokenBalanceSummary,
  getUnclaimedSPSSummary,
} from '@/lib/actions/getTokenBalance';
import {
  BalanceHistoryTokenType,
  SeasonBalanceHistory,
  TokenBalanceSummary,
} from '@/types/spl/balanceHistory';
import { useCallback, useState } from 'react';

const BALANCE_TOKENS: BalanceHistoryTokenType[] = ['GLINT', 'DEC', 'MERITS', 'VOUCHER', 'SPS'];
const ALL_TOKEN_KEYS = [...BALANCE_TOKENS, 'UNCLAIMED_SPS'];

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
        // Get season date range first
        const { start, end } = await getSeasonDates(seasonId);
        setState(prev => ({ ...prev }));

        const summaries: TokenBalanceSummary[] = [];

        // Fetch tokens one-by-one — sequential = rate-limit friendly
        for (const token of BALANCE_TOKENS) {
          setState(prev => ({
            ...prev,
            progress: prev.progress.map(p =>
              p.token === token ? { ...p, status: 'fetching' } : p
            ),
          }));

          try {
            const summary = await getTokenBalanceSummary(
              username,
              encryptedToken,
              token,
              start,
              end
            );
            summaries.push(summary);
            setState(prev => ({
              ...prev,
              progress: prev.progress.map(p => (p.token === token ? { ...p, status: 'done' } : p)),
            }));
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
          }
        }

        // Unclaimed SPS
        setState(prev => ({
          ...prev,
          progress: prev.progress.map(p =>
            p.token === 'UNCLAIMED_SPS' ? { ...p, status: 'fetching' } : p
          ),
        }));

        let unclaimedSummary: TokenBalanceSummary | null = null;
        try {
          unclaimedSummary = await getUnclaimedSPSSummary(username, encryptedToken, start, end);
          setState(prev => ({
            ...prev,
            progress: prev.progress.map(p =>
              p.token === 'UNCLAIMED_SPS' ? { ...p, status: 'done' } : p
            ),
          }));
        } catch (unclaimedErr) {
          setState(prev => ({
            ...prev,
            progress: prev.progress.map(p =>
              p.token === 'UNCLAIMED_SPS'
                ? {
                    ...p,
                    status: 'error',
                    errorMessage: unclaimedErr instanceof Error ? unclaimedErr.message : 'Error',
                  }
                : p
            ),
          }));
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          balanceHistory: {
            username,
            seasonId,
            dateRange: { start, end },
            balanceHistory: summaries,
            unclaimedHistory: unclaimedSummary ? [unclaimedSummary] : [],
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
