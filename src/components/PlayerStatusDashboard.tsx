import { useUsernameContext } from '@/contexts/UsernameContext';
import { usePlayerCardCollection } from '@/hooks/usePlayerCardCollection';
import { usePlayerStatus } from '@/hooks/usePlayerStatus';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Alert, Box, Container, Typography } from '@mui/material';
import { PlayerCard } from './PlayerCard';
import UsernameManager from './UsernameManager';

export default function PlayerStatusDashboard() {
  const { usernames, reorderUsernames } = useUsernameContext();
  const { data, loading, error, fetchPlayerStatus } = usePlayerStatus();
  const { data: cardData, loading: cardDataLoading, error: cardDataError, fetchPlayerCardCollection } =
      usePlayerCardCollection();


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleFetchData = () => {
    if (usernames.length > 0) {
      fetchPlayerStatus(usernames);
      fetchPlayerCardCollection(usernames);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const activeUsername = active.id as string;
      const overUsername = over.id as string;

      const oldIndex = usernames.indexOf(activeUsername);
      const newIndex = usernames.indexOf(overUsername);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderUsernames(oldIndex, newIndex);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 12 } }}>
      <Typography variant="h4" gutterBottom>
        Splinterlands Multi-Account Dashboard
      </Typography>

      {/* User Management Section */}
      <UsernameManager onFetchData={handleFetchData} loading={loading} />

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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {data.players &&
                Array.isArray(data.players) &&
                usernames.map(username => {
                  const player = data.players.find(
                    p => p.username === username
                  );
                  if (!player) return null;

                  return (
                    <PlayerCard
                      key={player.username}
                      player={player}
                      cardData={cardData?.players?.find(
                        p => p.username === player.username
                      )}
                      cardDataLoading={cardDataLoading}
                      cardDataError={cardDataError ?? undefined}
                    />
                  );
                })}
            </Box>
          </DndContext>
        </Box>
      )}

      {/* Empty State */}
      {!data && !loading && usernames.length === 0 && (
        <Alert severity="info">
          Add some player usernames and click &quot;Fetch Data&quot; to get
          started!
        </Alert>
      )}
    </Container>
  );
}
