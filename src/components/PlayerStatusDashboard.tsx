'use client';

import { CompletedDrawsDialog } from '@/components/CompletedDrawsDialog';
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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExploreIcon from '@mui/icons-material/Explore';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import UsernameManager from './UsernameManager';

export default function PlayerStatusDashboard() {
  const { usernames, reorderUsernames, isInitialized } = useUsernameContext();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const [frontierOpen, setFrontierOpen] = useState(false);
  const [rankedOpen, setRankedOpen] = useState(false);

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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h4">Splinterlands Multi-Account Dashboard</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ExploreIcon />}
            onClick={() => setFrontierOpen(true)}
            size="small"
          >
            Frontier Draws
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmojiEventsIcon />}
            onClick={() => setRankedOpen(true)}
            size="small"
          >
            Ranked Draws
          </Button>
        </Stack>
      </Box>

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

      <CompletedDrawsDialog
        open={frontierOpen}
        onClose={() => setFrontierOpen(false)}
        type="frontier"
        dashboardUsernames={usernames}
      />
      <CompletedDrawsDialog
        open={rankedOpen}
        onClose={() => setRankedOpen(false)}
        type="ranked"
        dashboardUsernames={usernames}
      />
    </Container>
  );
}
