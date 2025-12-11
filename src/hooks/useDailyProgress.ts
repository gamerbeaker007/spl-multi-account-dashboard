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
  const { isUserAuthenticated, authenticatedUsers } = useUsernameContext();

  const fetchDailyProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isAuthenticated = isUserAuthenticated(username);

      if (!isAuthenticated) {
        setError('Not authenticated, please log in to show daily progress');
        setData(null); // Clear data when not authenticated
        setLoading(false);
        return;
      }

      // Token will be retrieved from cookies on the server side
      const responseData = await getPlayersDailyProgress(username);
      setData(responseData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Daily progress fetch error:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username, isUserAuthenticated]);

  // Auto-fetch when authentication status changes
  useEffect(() => {
    const isAuthenticated = isUserAuthenticated(username);

    if (isAuthenticated) {
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
    isUserAuthenticated,
  ]);

  return {
    data,
    loading,
    error,
    fetchDailyProgress,
  };
};
