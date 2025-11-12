import { glint_icon_url } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Box, Stack, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';

interface Props {
  balances?: SplBalance[];
  seasonRewards?: SPLSeasonRewards;
}

export default function Glint({ balances, seasonRewards }: Props) {
  // Extract balance values
  const glint = balances?.find(b => b.token === 'GLINT')?.balance || 0;
  const modern = seasonRewards?.season_reward_info.modern_glint || 0;
  const wild = seasonRewards?.season_reward_info.wild_glint || 0;
  const survival = seasonRewards?.season_reward_info.survival_glint || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Glint
        </Typography>
        <BalanceItem iconUrl={glint_icon_url} title="Glint" value={largeNumberFormat(glint)} />
        <BalanceItem
          iconUrl={glint_icon_url}
          title="EOS Mordern Glint :"
          value={`M: ${largeNumberFormat(modern)}`}
        />
        <BalanceItem
          iconUrl={glint_icon_url}
          title="EOS Wild Glint"
          value={`W: ${largeNumberFormat(wild)}`}
        />
        <BalanceItem
          iconUrl={glint_icon_url}
          title="EOS Survival Glint"
          value={`S: ${largeNumberFormat(survival)}`}
        />
      </Stack>
    </Box>
  );
}
