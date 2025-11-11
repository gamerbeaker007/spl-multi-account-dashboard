import { PlayerCollectionValue } from '@/lib/collectionUtils';
import { useCallback, useState } from 'react';
import { fetchPlayersCollection } from '@/lib/actions/fetchPlayersCollection';

export interface PlayerCardCollectionData {
  username: string;
  collectionPower: number;
  playerCollectionValue: PlayerCollectionValue;
  error?: string;
}

export interface PlayerCardCollectionResponse {
  players: PlayerCardCollectionData[];
  timestamp: string;
}

export interface UsePlayerCardCollectionReturn {
  data: PlayerCardCollectionResponse | null;
  loading: boolean;
  error: string | null;
  fetchPlayerCardCollection: (usernames: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePlayerCardCollection(
  initialUsernames: string[] = []
): UsePlayerCardCollectionReturn {
  const [data, setData] = useState<PlayerCardCollectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsernames, setLastUsernames] = useState<string[]>(initialUsernames);

  const fetchPlayerCardCollection = useCallback(async (usernames: string[]) => {
    if (!usernames.length) {
      setError('No usernames provided');
      return;
    }

    setLoading(true);
    setError(null);
    setLastUsernames(usernames);

    try {
      const result = await fetchPlayersCollection(usernames);
      setData(result as PlayerCardCollectionResponse);
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
      await fetchPlayerCardCollection(lastUsernames);
    }
  }, [fetchPlayerCardCollection, lastUsernames]);

  return {
    data,
    loading,
    error,
    fetchPlayerCardCollection,
    refetch,
  };
}
