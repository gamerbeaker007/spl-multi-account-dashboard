import { getPlayersStatus } from '@/lib/actions/getPlayersStatus';
import { PlayerStatusData } from '@/types/playerStatus';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const isMountedRef = useRef(true);

  const fetchPlayerStatus = useCallback(async () => {
    // Don't fetch if username is invalid
    if (!username || !username.trim()) {
      setError('Invalid username');
      setData(null);
      return;
    }

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getPlayersStatus(username);
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch player status';
      if (isMountedRef.current) {
        setError(errorMessage);
        setData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [username]);

  const refetch = useCallback(async () => {
    await fetchPlayerStatus();
  }, [fetchPlayerStatus]);

  // Auto-fetch on mount (only if username is valid)
  useEffect(() => {
    isMountedRef.current = true;

    if (username && username.trim()) {
      fetchPlayerStatus();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [username, fetchPlayerStatus]);

  return {
    data,
    loading,
    error,
    fetchPlayerStatus,
    refetch,
  };
}
