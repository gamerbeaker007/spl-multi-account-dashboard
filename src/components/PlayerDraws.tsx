import { calculateEnergy } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { SplPlayerDetails } from '@/types/spl/details';
import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { Box, Card, Typography } from '@mui/material';

interface Props {
  balances: SplBalance[];
  frontier: SplFrontierDrawStatus | null;
  ranked: SplRankedDrawStatus | null;
  playerDetails?: SplPlayerDetails;
}

const MyProgressBar = ({ value, max }: { value: number; max: number }) => {
  return (
    <Box>
      <Typography variant="body2">Energy:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            flex: 1,
            height: 8,
            backgroundColor: 'grey.300',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${(value / max) * 100}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              borderRadius: 1,
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ minWidth: 'fit-content' }}>
          {Number(value).toFixed(0)} / {max}
        </Typography>
      </Box>
    </Box>
  );
};

export default function PlayerDraws({ balances, frontier, ranked, playerDetails }: Props) {
  // Calculate ranked energy from ECR balance
  const rankedEcr = balances.find(bal => bal.token === 'ECR');
  const rankedEnergy = rankedEcr
    ? calculateEnergy(rankedEcr.balance, rankedEcr.last_reward_time)
    : 0;

  // Calculate frontier energy from FECR balance
  const frontierEcr = balances.find(bal => bal.token === 'FECR');
  const frontierEnergy = frontierEcr
    ? calculateEnergy(frontierEcr.balance, frontierEcr.last_reward_time)
    : 0;

  const hasFrontierMatches = (playerDetails?.season_details?.foundation?.battles ?? 0) > 0;
  const hasRankedMatches =
    ((playerDetails?.season_details?.wild?.battles ?? 0) ||
      (playerDetails?.season_details?.modern?.battles ?? 0)) > 0;

  return (
    <Box mb={2} width={'100%'}>
      <Typography variant="h6">Modes</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
        {frontier && hasFrontierMatches && (
          <Card variant="outlined" sx={{ flex: 1, p: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Frontier
            </Typography>
            <MyProgressBar value={frontierEnergy ?? 0} max={50} />
            <Typography variant="subtitle2" color="secondary">
              Frontier Draw #{frontier.current_frontier_draw.id}
            </Typography>
            <Typography variant="body2">
              Entries: {frontier.current_frontier_draw.player_entries} /{' '}
              {frontier.current_frontier_draw.total_entries}
            </Typography>
            {frontier.first_unclaimed_frontier_draw && (
              <Typography variant="body2" color="warning.main">
                Unclaimed Prizes: #{frontier.first_unclaimed_frontier_draw.id}
              </Typography>
            )}
          </Card>
        )}
        {ranked && hasRankedMatches && (
          <Card variant="outlined" sx={{ flex: 1, p: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Ranked
            </Typography>
            <MyProgressBar value={rankedEnergy ?? 0} max={50} />
            <Typography variant="subtitle2" color="primary">
              Ranked Draw #{ranked.current_ranked_draw.id}
            </Typography>
            <Typography variant="body2">
              Entries: {ranked.current_ranked_draw.player_entries} /
              {ranked.current_ranked_draw.total_entries}
            </Typography>
            <Typography variant="body2">
              Has Pass: {ranked.current_ranked_draw.player_has_pass ? 'Yes' : 'No'}
            </Typography>
            {ranked.first_unclaimed_ranked_draw && (
              <Typography variant="body2" color="warning.main">
                Unclaimed Prizes: #{ranked.first_unclaimed_ranked_draw.id}
              </Typography>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
}
