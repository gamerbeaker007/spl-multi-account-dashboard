'use client';

import { CardSection } from '@/components/dashboard/CardSection';
import { useCardDetails } from '@/hooks/useCardDetails';
import { getDetailedPlayerCardCollection } from '@/lib/actions/getPlayersCardCollection';
import { DetailedPlayerCardCollection } from '@/types/card';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

export function PlayerDashboardContent({ username }: { username: string }) {
  const [cardCollection, setCardCollection] = useState<DetailedPlayerCardCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    cardDetails,
    loading: cardDetailsLoading,
    error: cardDetailsError,
  } = useCardDetails({ autoFetch: true });

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const collection = await getDetailedPlayerCardCollection(username);
        setCardCollection(collection);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load card collection');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [username]);

  const isLoading = loading || cardDetailsLoading;
  const hasError = error || cardDetailsError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error || cardDetailsError}
      </Alert>
    );
  }

  if (!cardCollection || !cardDetails) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No card collection data available
      </Alert>
    );
  }

  return <CardSection username={username} playerCards={cardCollection} />;
}
