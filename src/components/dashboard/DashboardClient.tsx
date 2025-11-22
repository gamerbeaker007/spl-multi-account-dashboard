'use client';

import { CardFilterDrawer } from '@/components/dashboard/CardFilterDrawer';
import { PlayerDashboardContent } from '@/components/dashboard/PlayerDashboardContent';
import { CardFilterProvider, useCardFilter } from '@/contexts/CardFilterContext';
import { useUsernameContext } from '@/contexts/UsernameContext';
import { Box, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function PlayerDashboardSkeleton() {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Skeleton
        variant="rectangular"
        width={150}
        height={150}
        sx={{ borderRadius: '50%', mb: 2 }}
      />
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={250} height={400} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={250} height={400} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={250} height={400} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={250} height={400} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );
}

function DashboardContent() {
  const { usernames, isInitialized } = useUsernameContext();
  const searchParams = useSearchParams();
  const userParam = searchParams.get('user');
  const router = useRouter();

  // Track if user manually changed selection
  const [manualSelection, setManualSelection] = useState<string | null>(null);

  // Derive selected user from manual selection, URL param, or first user
  const selectedUser = useMemo(() => {
    if (manualSelection) {
      return manualSelection;
    }
    if (userParam && usernames.includes(userParam)) {
      return userParam;
    }
    return usernames.length > 0 ? usernames[0] : null;
  }, [manualSelection, userParam, usernames]);

  const handleUserChange = (_event: React.MouseEvent<HTMLElement>, newUser: string | null) => {
    if (newUser !== null) {
      setManualSelection(newUser);
    }
  };

  // Redirect to home if no users
  useEffect(() => {
    if (isInitialized && usernames.length === 0) {
      router.push('/');
    }
  }, [isInitialized, usernames, router]);

  // Show loading only while not initialized
  if (!isInitialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography sx={{ ml: 2 }}>Loading users...</Typography>
      </Box>
    );
  }

  // Show nothing while redirecting (if no users)
  if (usernames.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography sx={{ ml: 2 }}>Redirecting to home...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* User Toggle Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <ToggleButtonGroup
          value={selectedUser}
          exclusive
          onChange={handleUserChange}
          aria-label="user selection"
          sx={{
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {usernames.map(username => (
            <ToggleButton
              key={username}
              value={username}
              aria-label={username}
              sx={{
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: selectedUser === username ? 'bold' : 'normal',
              }}
            >
              {username}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Content Area with Filter Context - Drawer loaded immediately */}
      {selectedUser && (
        <CardFilterProvider key="filter-provider">
          <DrawerAndContent selectedUser={selectedUser} />
        </CardFilterProvider>
      )}
    </Box>
  );
}

function DrawerAndContent({ selectedUser }: { selectedUser: string }) {
  const {
    drawerOpen,
    selectedSets,
    selectedRarities,
    selectedElements,
    selectedRoles,
    hideMissingCards,
    setSelectedSets,
    setSelectedRarities,
    setSelectedElements,
    setSelectedRoles,
    setHideMissingCards,
    toggleDrawer,
  } = useCardFilter();

  return (
    <Box display="flex" flex={1}>
      {/* Card Filter Drawer - Loaded immediately, persists across user switches */}
      <CardFilterDrawer
        open={drawerOpen}
        onToggle={toggleDrawer}
        selectedSets={selectedSets}
        selectedRarities={selectedRarities}
        selectedElements={selectedElements}
        selectedRoles={selectedRoles}
        hideMissingCards={hideMissingCards}
        onSetChange={setSelectedSets}
        onRarityChange={setSelectedRarities}
        onElementChange={setSelectedElements}
        onRoleChange={setSelectedRoles}
        onHideMissingCardsChange={setHideMissingCards}
      />

      {/* Main Content */}
      <Box flex={1} ml={drawerOpen ? 2 : 0}>
        <Suspense fallback={<PlayerDashboardSkeleton />}>
          <PlayerDashboardContent username={selectedUser} />
        </Suspense>
      </Box>
    </Box>
  );
}

export default function DashboardClient() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
        </Box>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
