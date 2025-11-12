'use client';

import { SplCardDetail } from '@/types/spl/cardDetails';
import { useCallback, useEffect, useState } from 'react';
import { getCardDetails } from '@/lib/actions/getCardDetails';

interface UseCardDetailsReturn {
  cardDetails: SplCardDetail[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCardDetailsOptions {
  autoFetch?: boolean;
}

export function useCardDetails(options: UseCardDetailsOptions = {}): UseCardDetailsReturn {
  const { autoFetch = true } = options;
  const [cardDetails, setCardDetails] = useState<SplCardDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cardResult = await getCardDetails();
      setCardDetails(cardResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Card data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    cardDetails,
    loading,
    error,
    refetch: fetchData,
  };
}
