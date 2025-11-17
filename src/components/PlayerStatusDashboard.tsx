'use client';

import { useUsernameContext } from '@/contexts/UsernameContext';
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
  const { usernames, reorderUsernames, isInitialized } = useUsernameContext();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Wait for context to initialize before rendering
  if (!isInitialized) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 8 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

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
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6, lg: 8 } }}>
      <Typography variant="h4" gutterBottom>
        Splinterlands Multi-Account Dashboard
      </Typography>

      {/* User Management Section */}
      <UsernameManager />

      {/* Data Display */}
      {usernames.length > 0 && (
        <Box>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {usernames.map(username => (
                <PlayerCard key={username} username={username} />
              ))}
            </Box>
          </DndContext>
        </Box>
      )}

      {/* Empty State */}
      {usernames.length === 0 && (
        <Alert severity="info">Add some player usernames to get started!</Alert>
      )}
    </Container>
  );
}
