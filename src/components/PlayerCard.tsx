'use client';

import GuildInfo from '@/components/PlayerBrawl';
import { useSeasonsContext } from '@/contexts/SeasonsContext';
import { useUsernameContext } from '@/contexts/UsernameContext';
import { usePlayerCardCollection } from '@/hooks/usePlayerCardCollection';
import { usePlayerSeasonRewards } from '@/hooks/usePlayerSeasonRewards';
import { usePlayerStatus } from '@/hooks/usePlayerStatus';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import Leaderboard from './Leaderboard';
import PlayerBalances from './PlayerBalances';
import PlayerDailies from './PlayerDailies';
import PlayerDraws from './PlayerDraws';
import PlayerInfo from './PlayerInfo';
import { PlayerHistoryButtons } from './reward-history/PlayerHistoryButtons';

interface Props {
  username: string;
}

export const PlayerCard = ({ username }: Props) => {
  const { data: player, loading, error, refetch } = usePlayerStatus(username);
  const {
    data: collectionData,
    loading: collectionLoading,
    refetch: collectionRefetch,
  } = usePlayerCardCollection(username);
  const {
    seasonRewards,
    loading: seasonRewardsLoading,
    error: seasonRewardsError,
    refetch: seasonRewardsRefetch,
  } = usePlayerSeasonRewards(username);
  const { seasons } = useSeasonsContext();
  const currentSeasonId = seasons[0]?.id; //for tesitng make undefined to disable season rewards until we have a better way to determine the correct season
  const { userRefreshTriggers, activeRefreshUser, advanceRefreshQueue, triggerRefreshUser } =
    useUsernameContext();

  const userTrigger = userRefreshTriggers[username];

  // Track queue state with refs to avoid stale-closure issues
  const startedFromQueueRef = useRef(false);
  // Becomes true once we observe at least one loading flag go true, confirming fetches started
  const queueFetchStartedRef = useRef(false);

  // Initial collection fetch on mount
  useEffect(() => {
    collectionRefetch();
  }, [collectionRefetch]);

  // When this card reaches the front of the refresh queue, fire a per-user trigger.
  // This causes PlayerCard and PlayerDailies to refresh while collection also refetches below.
  useEffect(() => {
    if (activeRefreshUser === username) {
      startedFromQueueRef.current = true;
      queueFetchStartedRef.current = false;
      triggerRefreshUser(username);
    }
  }, [activeRefreshUser, username, triggerRefreshUser]);

  // Per-user trigger: refetch status AND collection (queue OR per-card button)
  useEffect(() => {
    if (userTrigger && userTrigger > 0) {
      refetch();
      collectionRefetch();
      seasonRewardsRefetch();
    }
  }, [userTrigger, refetch, collectionRefetch, seasonRewardsRefetch]);

  // Once loading begins, mark it so the advance check knows fetches actually started
  useEffect(() => {
    if ((loading || collectionLoading) && startedFromQueueRef.current) {
      queueFetchStartedRef.current = true;
    }
  }, [loading, collectionLoading]);

  // Advance the queue only when BOTH status and collection have finished loading
  useEffect(() => {
    if (
      startedFromQueueRef.current &&
      queueFetchStartedRef.current &&
      !loading &&
      !collectionLoading
    ) {
      startedFromQueueRef.current = false;
      queueFetchStartedRef.current = false;
      advanceRefreshQueue();
    }
  }, [loading, collectionLoading, advanceRefreshQueue]);

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: username,
  });

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: username,
  });

  // Combine both refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  // Show loading state
  if (loading && !player) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        border="1px solid"
        borderColor="secondary.main"
        borderRadius={2}
        width={450}
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
        sx={{ mb: 2 }}
      >
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading {username}...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error || player?.error) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        border="1px solid"
        borderColor="error.main"
        borderRadius={2}
        width={450}
        p={2}
        sx={{ mb: 2 }}
      >
        <Alert severity="error">{error || player?.error}</Alert>
      </Box>
    );
  }

  // No data state
  if (!player) {
    return null;
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      border="1px solid"
      borderColor={isOver ? 'primary.main' : 'secondary.main'}
      borderRadius={2}
      width={450}
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap={2}
      p={2}
      sx={{
        mb: 2,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? 'action.hover' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover .drag-handle': {
          opacity: 1,
        },
      }}
    >
      {/* Drag Handle */}
      <IconButton
        className="drag-handle"
        {...listeners}
        {...attributes}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0.3,
          transition: 'opacity 0.2s ease',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          zIndex: 10,
        }}
        size="small"
      >
        <DragHandleIcon fontSize="small" />
      </IconButton>

      {/* Per-card Refresh Button */}
      <IconButton
        onClick={() => triggerRefreshUser(username)}
        disabled={loading || collectionLoading}
        title="Refresh"
        sx={{
          position: 'absolute',
          top: 8,
          right: 40,
          opacity: loading || collectionLoading ? 1 : 0.3,
          transition: 'opacity 0.2s ease',
          zIndex: 10,
          '&:hover': { opacity: 1 },
        }}
        size="small"
      >
        <RefreshIcon
          fontSize="small"
          sx={
            loading || collectionLoading
              ? {
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                }
              : {}
          }
        />
      </IconButton>

      <PlayerInfo username={player.username} playerDetails={player.playerDetails} />

      {/* History Button - Shows only when authorized */}
      <PlayerHistoryButtons
        username={player.username}
        seasonId={currentSeasonId}
        joinDate={player.playerDetails?.join_date}
      />

      <Box>
        {/* Balances Section */}
        <PlayerBalances
          username={player.username}
          balances={player.balances}
          seasonRewards={seasonRewards ?? undefined}
          glintLoading={seasonRewardsLoading}
          glintError={seasonRewardsError}
          collectionData={collectionData}
          collectionLoading={collectionLoading}
        />
      </Box>

      <Box width={'100%'}>
        {/* Draws Section */}
        {player.draws && player.balances && (
          <PlayerDraws
            balances={player.balances}
            frontier={player.draws.frontier}
            ranked={player.draws.ranked}
            playerDetails={player.playerDetails}
          />
        )}
      </Box>

      <Box width={'100%'}>
        {/* Daily Progress Section */}
        <GuildInfo
          username={player.username}
          playerDetails={player.playerDetails}
          brawlDetails={player.brawlDetails}
        />
      </Box>

      <Box width={'100%'}>
        {/* Daily Progress Section */}
        <PlayerDailies
          username={player.username}
          balances={player.balances}
          playerDetails={player.playerDetails}
        />
      </Box>
      <Box width={'100%'}>
        {/* Leaderboards Section */}
        {player.playerDetails && <Leaderboard playerDetails={player.playerDetails} />}
      </Box>
      <Typography variant="caption" sx={{ width: '100%', mt: 1 }}>
        Update Date: {player.timestamp ? new Date(player.timestamp).toLocaleString() : 'N/A'}
      </Typography>
    </Box>
  );
};
