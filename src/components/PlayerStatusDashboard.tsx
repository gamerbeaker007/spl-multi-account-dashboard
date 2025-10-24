import { usePlayerStatus } from '@/hooks/usePlayerStatus';
import { Alert, Box, Container, Typography } from '@mui/material';
import { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import UsernameManager from './UsernameManager';
import { usePlayerCardCollection } from '@/hooks/usePlayerCardCollection';

export default function PlayerStatusDashboard() {
  const [currentUsernames, setCurrentUsernames] = useState<string[]>([]);
  const { data, loading, error, fetchPlayerStatus } = usePlayerStatus();
  const { data: cardData, loading: cardDataLoading, error: cardDataError, fetchPlayerCardCollection } =
      usePlayerCardCollection();


  const handleUsernamesChange = (usernames: string[]) => {
    setCurrentUsernames(usernames);
  };

  const handleFetchData = () => {
    if (currentUsernames.length > 0) {
      fetchPlayerStatus(currentUsernames);
      fetchPlayerCardCollection(currentUsernames);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 12 } }}>
      <Typography variant="h4" gutterBottom>
        Splinterlands Multi-Account Dashboard
      </Typography>

      {/* User Management Section */}
      <UsernameManager
        onUsernamesChange={handleUsernamesChange}
        onFetchData={handleFetchData}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Display */}
      {data && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Player Data (Last updated:{' '}
            {new Date(data.timestamp)
              .toISOString()
              .replace('T', ' ')
              .slice(0, 19)}
            )
          </Typography>

          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {data.players &&
              Array.isArray(data.players) &&
              data.players.map(player => (
                <PlayerCard
                  key={player.username}
                  player={player}
                  cardData={cardData?.players?.find(p => p.username === player.username)}
                  cardDataLoading={cardDataLoading}
                  cardDataError={cardDataError ?? undefined}
                />
              ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {!data && !loading && currentUsernames.length === 0 && (
        <Alert severity="info">
          Add some player usernames and click &quot;Fetch Data&quot; to get
          started!
        </Alert>
      )}
    </Container>
  );
}
