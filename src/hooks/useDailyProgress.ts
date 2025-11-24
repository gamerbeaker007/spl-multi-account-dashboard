import { useUsernameContext } from '@/contexts/UsernameContext';
import { getPlayersDailyProgress } from '@/lib/actions/getPlayersDailyProgress';
import { DailyProgressData } from '@/types/playerDailyProgress';
import { useCallback, useEffect, useState } from 'react';

interface UseDailyProgressReturn {
  data: DailyProgressData | null;
  loading: boolean;
  error: string | null;
  fetchDailyProgress: () => Promise<void>;
}

export const useDailyProgress = (username: string): UseDailyProgressReturn => {
  const [data, setData] = useState<DailyProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUserToken, isUserAuthenticated, authenticatedUsers } = useUsernameContext();

  const fetchDailyProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const encryptedToken = getUserToken(username);
      const isAuthenticated = isUserAuthenticated(username);

      if (!encryptedToken || !isAuthenticated) {
        setError('Not authenticated, please log in to show daily progress');
        setData(null); // Clear data when not authenticated
        setLoading(false);
        return;
      }

      const responseData = await getPlayersDailyProgress(username, encryptedToken);
      setData(responseData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Daily progress fetch error:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username, getUserToken, isUserAuthenticated]);

  // Auto-fetch when authentication status changes
  useEffect(() => {
    const isAuthenticated = isUserAuthenticated(username);
    const encryptedToken = getUserToken(username);

    if (isAuthenticated && encryptedToken) {
      // User is logged in - fetch daily progress
      fetchDailyProgress();
    } else {
      // User logged out - clear data
      setData(null);
      setError('Not authenticated, please log in to show daily progress');
    }
  }, [
    // Watch for changes in the authenticated users array
    // This will trigger when user logs in/out
    authenticatedUsers,
    username,
    fetchDailyProgress,
    getUserToken,
    isUserAuthenticated,
  ]);

  return {
    data,
    loading,
    error,
    fetchDailyProgress,
  };
};
