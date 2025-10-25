import { useAuth } from '@/contexts/AuthContext';
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
          setError(
            'No authenticated users found. Please log in to view daily progress.'
          );
          setLoading(false);
          return;
        }

        const response = await fetch('/api/dailies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            users: usersWithTokens,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch daily progress: ${response.status}`
          );
        }

        const responseData: DailyProgressResponse = await response.json();
        setData(responseData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
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
