import { useAuth } from '@/contexts/AuthContext';
import { fetchPlayersDailyProgress } from '@/lib/actions/fetchPlayersDailyProgress';
import { SplDailyProgress } from '@/types/spl/dailies';
import { useCallback, useState } from 'react';

interface DailyProgressData {
  username: string;
  dailyProgress?: {
    foundation?: SplDailyProgress;
    wild?: SplDailyProgress;
    modern?: SplDailyProgress;
  };
  error?: string;
}

interface DailyProgressResponse {
  players: DailyProgressData[];
  timestamp: string;
}

interface UseDailyProgressReturn {
  data: DailyProgressResponse | null;
  loading: boolean;
  error: string | null;
  fetchDailyProgress: (usernames: string[]) => Promise<void>;
}

export const useDailyProgress = (): UseDailyProgressReturn => {
  const [data, setData] = useState<DailyProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUserToken, isUserAuthenticated } = useAuth();

  const fetchDailyProgress = useCallback(
    async (usernames: string[]) => {
      if (!usernames.length) {
        setError('No usernames provided');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Prepare the request payload with usernames and their tokens
        const usersWithTokens = usernames.map(username => ({
          username,
          encryptedToken: getUserToken(username),
          isAuthenticated: isUserAuthenticated(username),
        }));

        // Check if any users are authenticated
        const authenticatedUsers = usersWithTokens.filter(
          user => user.isAuthenticated && user.encryptedToken
        );

        if (authenticatedUsers.length === 0) {
          setError('Not authenticated, please log in to show daily progress');
          setLoading(false);
          return;
        }

        const responseData = await fetchPlayersDailyProgress(authenticatedUsers);
        setData(responseData as DailyProgressResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Daily progress fetch error:', err);
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [getUserToken, isUserAuthenticated]
  );

  return {
    data,
    loading,
    error,
    fetchDailyProgress,
  };
};
