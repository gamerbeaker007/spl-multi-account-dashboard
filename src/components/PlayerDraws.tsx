import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import { Box, Card, Typography } from '@mui/material';

interface Props {
  frontier: SplFrontierDrawStatus | null;
  energyFrontier: number;
  ranked: SplRankedDrawStatus | null;
  energyRanked: number;
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

export default function PlayerDraws({
  frontier,
  energyFrontier,
  ranked,
  energyRanked,
}: Props) {
  return (
    <Box mb={2} width={'100%'}>
      <Typography variant="h6">Modes</Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}
      >
        {ranked && (
          <Card variant="outlined" sx={{ flex: 1, p: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Ranked
            </Typography>
            <MyProgressBar value={energyRanked} max={50} />
            <Typography variant="subtitle2" color="primary">
              Ranked Draw #{ranked.current_ranked_draw.id}
            </Typography>
            <Typography variant="body2">
              Entries: {ranked.current_ranked_draw.player_entries} /
              {ranked.current_ranked_draw.total_entries}
            </Typography>
            <Typography variant="body2">
              Has Pass:{' '}
              {ranked.current_ranked_draw.player_has_pass ? 'Yes' : 'No'}
            </Typography>
            {ranked.first_unclaimed_ranked_draw && (
              <Typography variant="body2" color="warning.main">
                Unclaimed Draw: #{ranked.first_unclaimed_ranked_draw.id}
              </Typography>
            )}
          </Card>
        )}

        {frontier && (
          <Card variant="outlined" sx={{ flex: 1, p: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Frontier
            </Typography>
            <MyProgressBar value={energyFrontier} max={50} />
            <Typography variant="subtitle2" color="secondary">
              Frontier Draw #{frontier.current_frontier_draw.id}
            </Typography>
            <Typography variant="body2">
              Entries: {frontier.current_frontier_draw.player_entries} /{' '}
              {frontier.current_frontier_draw.total_entries}
            </Typography>
            {frontier.first_unclaimed_frontier_draw && (
              <Typography variant="body2" color="warning.main">
                Unclaimed Draw: #{frontier.first_unclaimed_frontier_draw.id}
              </Typography>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
}
