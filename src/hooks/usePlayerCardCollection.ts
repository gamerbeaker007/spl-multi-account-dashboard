import { fetchPlayersCardCollectionValue } from '@/lib/actions/fetchPlayersCardCollection';
import { PlayerCardCollectionData } from '@/types/playerCardCollection';
import { useCallback, useState } from 'react';

export interface UsePlayerCardCollectionReturn {
  data: PlayerCardCollectionData | null;
  loading: boolean;
  error: string | null;
  fetchPlayerCardCollection: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePlayerCardCollection(username: string): UsePlayerCardCollectionReturn {
  const [data, setData] = useState<PlayerCardCollectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerCardCollection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPlayersCardCollectionValue(username);
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
    await fetchPlayerCardCollection();
  }, [fetchPlayerCardCollection]);

  return {
    data,
    loading,
    error,
    fetchPlayerCardCollection,
    refetch,
  };
}
