import {
  unbind_ca_c_icon_url,
  unbind_ca_e_icon_url,
  unbind_ca_l_icon_url,
  unbind_ca_r_icon_url,
} from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Box, Stack, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';

interface Props {
  balances: SplBalance[];
}

export default function Scrolls({ balances }: Props) {
  // Extract balance values
  const common_unbind =
    balances.find(b => b.token === 'UNBIND_CA_C')?.balance || 0;
  const rare_unbind =
    balances.find(b => b.token === 'UNBIND_CA_R')?.balance || 0;
  const epic_unbind =
    balances.find(b => b.token === 'UNBIND_CA_E')?.balance || 0;
  const legendary_unbind =
    balances.find(b => b.token === 'UNBIND_CA_L')?.balance || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Scrolls
        </Typography>
        <BalanceItem
          iconUrl={unbind_ca_c_icon_url}
          title="Common Unbind Scroll"
          value={largeNumberFormat(common_unbind)}
        />
        <BalanceItem
          iconUrl={unbind_ca_r_icon_url}
          title="Rare Unbind Scroll"
          value={largeNumberFormat(rare_unbind)}
        />
        <BalanceItem
          iconUrl={unbind_ca_e_icon_url}
          title="Epic Unbind Scroll"
          value={largeNumberFormat(epic_unbind)}
        />
        <BalanceItem
          iconUrl={unbind_ca_l_icon_url}
          title="Legendary Unbind Scroll"
          value={largeNumberFormat(legendary_unbind)}
        />
      </Stack>
    </Box>
  );
}
