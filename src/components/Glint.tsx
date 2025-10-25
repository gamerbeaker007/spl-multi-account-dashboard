import { glint_icon_url } from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Box, Stack, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';

interface Props {
  balances: SplBalance[];
}

export default function Glint({ balances }: Props) {
  // Extract balance values
  const glint = balances.find(b => b.token === 'GLINT')?.balance || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Glint
        </Typography>
        <BalanceItem iconUrl={glint_icon_url} title="Glint" value={largeNumberFormat(glint)} />
      </Stack>
    </Box>
  );
}
