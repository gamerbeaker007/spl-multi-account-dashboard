import { PlayerCardCollectionData } from '@/hooks/usePlayerCardCollection';
import { PlayerStatusData } from '@/hooks/usePlayerStatus';
import { SplBalance } from '@/types/spl/balances';
import { SplDailyProgress } from '@/types/spl/dailies';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Alert, Box, IconButton } from '@mui/material';
import Leaderboard from './Leaderboard';
import PlayerBalances from './PlayerBalances';
import PlayerDailies from './PlayerDailies';
import PlayerDraws from './PlayerDraws';
import PlayerInfo from './PlayerInfo';

interface Props {
  player: PlayerStatusData;
  balances?: SplBalance[];
  cardData?: PlayerCardCollectionData;
  cardDataLoading?: boolean;
  cardDataError?: string;
  dailyProgress?: {
    foundation?: SplDailyProgress;
    wild?: SplDailyProgress;
    modern?: SplDailyProgress;
  };
  dailyProgressLoading?: boolean;
  dailyProgressError?: string;
  onAuthChange?: () => void;
}

export const PlayerCard = ({
  player,
  cardData,
  cardDataLoading,
  cardDataError,
  dailyProgress,
  dailyProgressLoading,
  dailyProgressError,
  onAuthChange,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: player.username,
  });

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: player.username,
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

      {player.error ? (
        <Alert severity="error">{player.error}</Alert>
      ) : (
        <>
          <PlayerInfo
            username={player.username}
            leaderboards={player.leaderboards}
            onAuthChange={onAuthChange}
          />
          <Box>
            {/* Balances Section */}
            {player.balances && player.balances.length > 0 && (
              <PlayerBalances
                balances={player.balances}
                cardData={cardData}
                cardDataLoading={cardDataLoading}
                cardDataError={cardDataError}
              />
            )}
          </Box>

          <Box width={'100%'}>
            {/* Draws Section */}
            {player.draws && player.balances && (
              <PlayerDraws
                balances={player.balances}
                frontier={player.draws.frontier}
                ranked={player.draws.ranked}
                leaderboards={player.leaderboards}
              />
            )}
          </Box>
          <Box width={'100%'}>
            {/* Daily Progress Section */}
            <PlayerDailies
              leaderboards={player.leaderboards}
              dailyProgress={dailyProgress}
              dailyProgressLoading={dailyProgressLoading}
              dailyProgressError={dailyProgressError ?? undefined}
            />
          </Box>
          <Box width={'100%'}>
            {/* Leaderboards Section */}
            {player.leaderboards && <Leaderboard leaderboards={player.leaderboards} />}
          </Box>
        </>
      )}
    </Box>
  );
};
