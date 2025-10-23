import { usePlayerStatus } from '@/hooks/usePlayerStatus';
import { Alert, Box, Container, Typography } from '@mui/material';
import { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import UsernameManager from './UsernameManager';

export default function PlayerStatusDashboard() {
  const [currentUsernames, setCurrentUsernames] = useState<string[]>([]);
  const { data, loading, error, fetchPlayerStatus } = usePlayerStatus();

  const handleUsernamesChange = (usernames: string[]) => {
    setCurrentUsernames(usernames);
  };

  const handleFetchData = () => {
    if (currentUsernames.length > 0) {
      fetchPlayerStatus(currentUsernames);
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
            {new Date(data.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            )
          </Typography>

          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {data.players &&
              Array.isArray(data.players) &&
              data.players.map(player => (
                <PlayerCard
                  key={player.username}
                  player={player}
                  balances={player.balances}
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
