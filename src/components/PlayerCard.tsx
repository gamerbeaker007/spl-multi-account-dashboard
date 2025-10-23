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
}

export const PlayerCard = ({ player, balances }: Props) => {
  const frontierEnergy = balances?.find(b => b.token === 'FECR')?.balance || 0;
  const rankedEnergy = balances?.find(b => b.token === 'ECR')?.balance || 0;
  console.log('Frontier Energy:', frontierEnergy);
  console.log('Ranked Energy:', rankedEnergy);
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
              <PlayerBalances balances={player.balances} />
            )}
          </Box>
          <Box width={'100%'}>
            {/* Draws Section */}
            {player.draws && (
              <PlayerDraws
                frontier={player.draws.frontier}
                energyFrontier={frontierEnergy}
                ranked={player.draws.ranked}
                energyRanked={rankedEnergy}
              />
            )}
          </Box>
          <Box>
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
