'use client';

import { getPlayerSeasonRewards } from '@/lib/actions/getPlayerSeasonRewards';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_RETRY_DELAY_MS = 8_000;
const MAX_AUTO_RETRIES = 3;

export interface UsePlayerSeasonRewardsReturn {
  seasonRewards: SPLSeasonRewards | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlayerSeasonRewards(username: string): UsePlayerSeasonRewardsReturn {
  const [seasonRewards, setSeasonRewards] = useState<SPLSeasonRewards | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const fetchRewards = useCallback(
    async (isAutoRetry = false) => {
      if (!username?.trim()) return;
      if (!isMountedRef.current) return;

      // Cancel any pending auto-retry before starting a new fetch
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Manual refetch resets the retry counter
      if (!isAutoRetry) {
        retryCountRef.current = 0;
      }

      setLoading(true);
      setError(null);

      try {
        const rewards = await getPlayerSeasonRewards(username);
        if (isMountedRef.current) {
          retryCountRef.current = 0;
          setSeasonRewards(rewards);
        }
      } catch {
        if (isMountedRef.current) {
          if (retryCountRef.current < MAX_AUTO_RETRIES) {
            retryCountRef.current += 1;
            setError(
              `Season glint unavailable — retrying (${retryCountRef.current}/${MAX_AUTO_RETRIES})`
            );
            retryTimerRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                fetchRewards(true);
              }
            }, AUTO_RETRY_DELAY_MS);
          } else {
            setError('Unable to fetch data within 10s');
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [username]
  );

  useEffect(() => {
    isMountedRef.current = true;
    retryCountRef.current = 0;
    fetchRewards();
    return () => {
      isMountedRef.current = false;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [fetchRewards]);

  return { seasonRewards, loading, error, refetch: fetchRewards };
}
