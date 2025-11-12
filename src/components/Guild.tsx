import { gp_icon_url, merits_icon_url } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Box, Stack, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';

interface Props {
  balances?: SplBalance[];
}

export default function Guild({ balances }: Props) {
  // Extract balance values
  const merits = balances?.find(b => b.token === 'MERITS')?.balance || 0;
  const gp = balances?.find(b => b.token === 'GP')?.balance || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Guild
        </Typography>
        <BalanceItem iconUrl={merits_icon_url} title="Merits" value={largeNumberFormat(merits)} />
        <BalanceItem iconUrl={gp_icon_url} title="Guild Power" value={largeNumberFormat(gp)} />
      </Stack>
    </Box>
  );
}
