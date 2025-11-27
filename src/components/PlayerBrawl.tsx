'use client';

import BrawlTime from '@/components/BrawlTime';
import { SplBrawlDetails } from '@/types/spl/brawl';
import { SplPlayerDetails } from '@/types/spl/details';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import { TbSwords } from 'react-icons/tb';

interface Props {
  username: string;
  playerDetails?: SplPlayerDetails;
  brawlDetails?: SplBrawlDetails;
}

const statusMap: Record<number, string> = {
  0: 'Upcomming',
  1: 'In Progress',
  2: 'Completed',
  3: '???',
  4: 'Cancelled',
};

const statusColor: Record<number, string> = {
  0: 'warning.main',
  1: 'success.main',
  2: 'error.main',
  3: 'text.secondary',
  4: 'error.main',
};

export default function GuildInfo({ username, playerDetails, brawlDetails }: Props) {
  const playerBrawls = brawlDetails?.players?.find(p => p.player === username) || null;
  const brawlCycleRAW = brawlDetails?.id.split('-').find(id => id.startsWith('BC')) || '';
  const brawlCycle = brawlCycleRAW.split('BC')[1];

  const battleColor =
    (playerBrawls?.total_battles ?? 0) - (playerBrawls?.entered_battles ?? 0) > 0
      ? 'error.main'
      : 'success.main';

  return (
    <Box width={'100%'} height={270}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box sx={{ color: 'secondary.main' }}>
            <TbSwords color="primary" />
          </Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Brawl Info
          </Typography>
        </Box>
      </Box>
      {!brawlDetails || !playerDetails ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No Brawl information found, not a member of a guild?
        </Alert>
      ) : (
        <>
          <Typography variant={'h6'}>Guild: {playerDetails.guild?.name}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
            <Card variant="outlined" sx={{ mb: 1, flex: 1 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                  <Typography
                    variant={'body1'}
                    color={'secondary'}
                    fontSize={18}
                    fontWeight={'bold'}
                  >
                    Brawl:
                  </Typography>
                  <Typography variant={'body1'}>Cycle: {brawlCycle} </Typography>
                  <Typography variant={'body1'} color={statusColor[brawlDetails?.status ?? 0]}>
                    Status: {statusMap[brawlDetails?.status ?? 0]}{' '}
                  </Typography>
                  {brawlDetails?.status !== 0 && (
                    <Typography variant={'body1'}>
                      Battles: {brawlDetails?.completed_battles} / {brawlDetails?.total_battles}
                    </Typography>
                  )}
                  {brawlDetails?.start_date && (
                    <BrawlTime startDate={brawlDetails.start_date} status={brawlDetails.status} />
                  )}
                </Box>
              </CardContent>
            </Card>
            {brawlDetails?.status !== 0 && playerBrawls && (
              <Card variant="outlined" sx={{ mb: 1, flex: 1 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                    <Typography
                      variant={'body1'}
                      color={'secondary'}
                      fontSize={18}
                      fontWeight={'bold'}
                    >
                      {playerBrawls?.player}
                    </Typography>
                    <Typography variant={'body1'}>
                      Fray: {(playerBrawls?.fray_index ?? 0) + 1}{' '}
                    </Typography>
                    <Typography variant={'body1'} color={battleColor}>
                      Battles: {playerBrawls?.entered_battles} / {playerBrawls?.total_battles}
                    </Typography>
                    <Typography variant={'body1'}>
                      W/L: {playerBrawls?.wins} / {playerBrawls?.losses ?? 0}{' '}
                    </Typography>
                    <Typography variant={'body1'}>Auto Wins: {playerBrawls?.auto_wins} </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
