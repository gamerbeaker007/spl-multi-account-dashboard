import { PlayerCardCollectionData } from '@/hooks/usePlayerCardCollection';
import { PlayerStatusData } from '@/hooks/usePlayerStatus';
import { SplBalance } from '@/types/spl/balances';
import PersonIcon from '@mui/icons-material/Person';
import { Alert, Box, Chip, Typography } from '@mui/material';
import Leaderboard from './Leaderboard';
import PlayerBalances from './PlayerBalances';
import PlayerDraws from './PlayerDraws';

interface Props {
  player: PlayerStatusData;
  balances?: SplBalance[];
  cardData?: PlayerCardCollectionData;
  cardDataLoading?: boolean;
  cardDataError?: string;
}

export const PlayerCard = ({
  player,
  cardData,
  cardDataLoading,
  cardDataError,
}: Props) => {
  return (
    <Box
      border="1px solid"
      borderColor="secondary.main"
      borderRadius={2}
      width={400}
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap={2}
      p={2}
      sx={{ mb: 2 }}
    >
      <Box width="100%">
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PersonIcon />
          {player.username}
          {player.error && <Chip label="Error" color="error" size="small" />}
        </Typography>
      </Box>

      {player.error ? (
        <Alert severity="error">{player.error}</Alert>
      ) : (
        <>
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
              />
            )}
          </Box>
          <Box width={'100%'}>
            {/* Leaderboards Section */}
            {player.leaderboards && (
              <Leaderboard leaderboards={player.leaderboards} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
