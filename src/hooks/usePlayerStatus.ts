import { fetchPlayersStatus } from '@/lib/actions/fetchPlayersStatus';
import { PlayerStatusData } from '@/types/playerStatus';
import { useCallback, useEffect, useState } from 'react';

export interface UsePlayerStatusReturn {
  data: PlayerStatusData | null;
  loading: boolean;
  error: string | null;
  fetchPlayerStatus: (username: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePlayerStatus(username: string): UsePlayerStatusReturn {
  const [data, setData] = useState<PlayerStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerStatus = useCallback(async () => {
    // Don't fetch if username is invalid
    if (!username || !username.trim()) {
      setError('Invalid username');
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchPlayersStatus(username);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch player status';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const refetch = useCallback(async () => {
    await fetchPlayerStatus();
  }, [fetchPlayerStatus]);

  // Auto-fetch on mount (only if username is valid)
  useEffect(() => {
    if (username && username.trim()) {
      fetchPlayerStatus();
    }
  }, [fetchPlayerStatus, username]);

  return {
    data,
    loading,
    error,
    fetchPlayerStatus,
    refetch,
  };
}
