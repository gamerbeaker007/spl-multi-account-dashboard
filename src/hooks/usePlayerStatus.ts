import { useUsernameContext } from '@/contexts/UsernameContext';
import { getPlayerBalances } from '@/lib/actions/getPlayerBalances';
import { getPlayerDetails } from '@/lib/actions/getPlayerDetails';
import { getPlayerDraws } from '@/lib/actions/getPlayerDraws';
import { getPlayerSeasonRewards } from '@/lib/actions/getPlayerSeasonRewards';
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
  const { getUserToken } = useUsernameContext();

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
      const encryptedToken = getUserToken(username);

      const [balancesResult, drawsResult, detailsResult, seasonResult] = await Promise.allSettled([
        getPlayerBalances(username),
        getPlayerDraws(username),
        getPlayerDetails(username, encryptedToken),
        getPlayerSeasonRewards(username),
      ]);

      if (!isMountedRef.current) return;

      const result: PlayerStatusData = {
        username,
        timestamp: new Date().toISOString(),
      };

      if (balancesResult.status === 'fulfilled') {
        result.balances = balancesResult.value;
      } else {
        result.balancesError =
          balancesResult.reason instanceof Error
            ? balancesResult.reason.message
            : 'Failed to fetch balances';
      }

      if (drawsResult.status === 'fulfilled') {
        result.draws = drawsResult.value;
      } else {
        result.drawsError =
          drawsResult.reason instanceof Error
            ? drawsResult.reason.message
            : 'Failed to fetch draws';
      }

      if (detailsResult.status === 'fulfilled') {
        result.playerDetails = detailsResult.value.playerDetails;
        result.brawlDetails = detailsResult.value.brawlDetails;
      } else {
        result.detailsError =
          detailsResult.reason instanceof Error
            ? detailsResult.reason.message
            : 'Failed to fetch player details';
      }

      if (seasonResult.status === 'fulfilled') {
        result.seasonRewards = seasonResult.value;
      } else {
        result.seasonRewardsError =
          seasonResult.reason instanceof Error
            ? seasonResult.reason.message
            : 'Failed to fetch season rewards';
      }

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
  }, [username, getUserToken]);

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
