import { PlayerStatusData, usePlayerStatus } from '@/hooks/usePlayerStatus';
import { Person as PersonIcon } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { useState } from 'react';
import Leaderboard from './Leaderboard';
import PlayerBalances from './PlayerBalances';
import PlayerDraws from './PlayerDraws';
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

  const PlayerCard = ({ player }: { player: PlayerStatusData }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PersonIcon />
          {player.username}
          {player.error && <Chip label="Error" color="error" size="small" />}
        </Typography>

        {player.error ? (
          <Alert severity="error">{player.error}</Alert>
        ) : (
          <Box>
            {/* Balances Section */}
            {player.balances &&
              Array.isArray(player.balances) &&
              player.balances.length > 0 && (
                <PlayerBalances balances={player.balances} />
              )}

            {/* Draws Section */}
            {player.draws && (
              <PlayerDraws
                frontier={player.draws.frontier}
                ranked={player.draws.ranked}
              />
            )}

            {/* Leaderboards Section */}
            {player.leaderboards && (
              <Leaderboard leaderboards={player.leaderboards} />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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

          {data.players &&
            Array.isArray(data.players) &&
            data.players.map(player => (
              <PlayerCard key={player.username} player={player} />
            ))}
        </Box>
      )}

      {/* Empty State */}
      {!data && !loading && currentUsernames.length === 0 && (
        <Alert severity="info">
          Add some player usernames and click &quot;Fetch Data&quot; to get
          started!
        </Alert>
      )}
    </Box>
  );
}
