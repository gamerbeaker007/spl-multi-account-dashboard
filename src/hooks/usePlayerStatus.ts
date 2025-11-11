import { SplBalance } from '@/types/spl/balances';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { useCallback, useState } from 'react';
import { fetchPlayersStatus } from '@/lib/actions/fetchPlayersStatus';

export interface PlayerStatusData {
  username: string;
  balances?: SplBalance[];
  draws?: {
    frontier: SplFrontierDrawStatus;
    ranked: SplRankedDrawStatus;
  };
  playerDetails?: SplPlayerDetails;
  error?: string;
}

export interface PlayerStatusResponse {
  players: PlayerStatusData[];
  timestamp: string;
  seasonId: number;
}

export interface UsePlayerStatusReturn {
  data: PlayerStatusResponse | null;
  loading: boolean;
  error: string | null;
  fetchPlayerStatus: (usernames: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePlayerStatus(initialUsernames: string[] = []): UsePlayerStatusReturn {
  const [data, setData] = useState<PlayerStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsernames, setLastUsernames] = useState<string[]>(initialUsernames);

  const fetchPlayerStatus = useCallback(async (usernames: string[]) => {
    if (!usernames.length) {
      setError('No usernames provided');
      return;
    }

    setLoading(true);
    setError(null);
    setLastUsernames(usernames);

    try {
      const result = await fetchPlayersStatus(usernames);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch player status';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (lastUsernames.length > 0) {
      await fetchPlayerStatus(lastUsernames);
    }
  }, [fetchPlayerStatus, lastUsernames]);

  return {
    data,
    loading,
    error,
    fetchPlayerStatus,
    refetch,
  };
}
