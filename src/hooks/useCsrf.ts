import { useState, useCallback } from 'react';

interface CsrfTokenData {
  token: string;
  fetchedAt: number; // timestamp when token was fetched
}

export function useCsrfToken() {
  const [csrfData, setCsrfData] = useState<CsrfTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current token is likely expired (23 hours to be safe)
  const isTokenExpired = useCallback(() => {
    if (!csrfData) return true;

    const tokenAge = Date.now() - csrfData.fetchedAt;
    // const maxAge = 10000; //FOR DEBUG
    const maxAge = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

    return tokenAge >= maxAge;
  }, [csrfData]);

  // Fetch CSRF token when needed (lazy loading with expiration check)
  const getCsrfToken = useCallback(async (): Promise<string> => {
    // Return existing token if still valid
    if (csrfData && !isTokenExpired()) {
      return csrfData.token;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/csrf', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      if (!data.csrfToken) {
        throw new Error('No CSRF token in response');
      }

      const tokenData = {
        token: data.csrfToken,
        fetchedAt: Date.now(),
      };

      setCsrfData(tokenData);
      return data.csrfToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CSRF token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [csrfData, isTokenExpired]);

  // Clear token (useful for logout or forced refresh)
  const clearToken = useCallback(() => {
    setCsrfData(null);
    setError(null);
  }, []);

  return {
    csrfToken: csrfData?.token || null,
    getCsrfToken,
    clearToken,
    loading,
    error,
    isExpired: isTokenExpired(),
  };
}
