import { SplFrontierDrawStatus, SplRankedDrawStatus } from '@/types/spl/draws';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';


interface Props {
  frontier: SplFrontierDrawStatus | null;
  ranked: SplRankedDrawStatus | null;
}

export default function PlayerDraws({ frontier, ranked }: Props) {
  return (
    <Box mb={2}>
      <Typography variant="h6">Draw Status</Typography>
      <Box
        minWidth="100px"
        sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
      >
        {ranked && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary">
                Ranked Draw #{ranked.current_ranked_draw.id}
              </Typography>
              <Typography variant="body2">
                Entries: {ranked.current_ranked_draw.player_entries} /{' '}
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
            </CardContent>
          </Card>
        )}

        {frontier && (
          <Card variant="outlined">
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
