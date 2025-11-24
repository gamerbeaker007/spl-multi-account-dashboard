import { getPlayerHistory } from '@/lib/actions/getPlayerHistory';
import { ParsedPlayerRewardHistory } from '@/types/parsedHistory';
import { useCallback, useState } from 'react';

interface UsePlayerHistoryState {
  isLoading: boolean;
  error: string | null;
  rewardHistory: ParsedPlayerRewardHistory | null;
}

interface UsePlayerHistoryReturn extends UsePlayerHistoryState {
  fetchHistory: (player: string, token: string, seasonId: number) => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

export function usePlayerHistory(): UsePlayerHistoryReturn {
  const [state, setState] = useState<UsePlayerHistoryState>({
    isLoading: false,
    error: null,
    rewardHistory: null,
  });

  const fetchHistory = useCallback(async (player: string, token: string, seasonId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getPlayerHistory(player, token, seasonId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        history: result.allEntries,
        rewardHistory: result,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
      rewardHistory: null,
      seasonInfo: null,
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchHistory,
    clearHistory,
    clearError,
  };
}
