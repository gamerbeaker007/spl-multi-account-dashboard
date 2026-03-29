import { glint_icon_url } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { SPLSeasonRewards } from '@/types/spl/seasonRewards';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { BalanceItem } from './BalanceItem';

interface Props {
  balances?: SplBalance[];
  seasonRewards?: SPLSeasonRewards;
  glintLoading?: boolean;
  glintError?: string | null;
}

export default function Glint({ balances, seasonRewards, glintLoading, glintError }: Props) {
  // Extract balance values
  const glint = balances?.find(b => b.token === 'GLINT')?.balance || 0;
  const modern = seasonRewards?.season_reward_info.modern_glint ?? 0;
  const wild = seasonRewards?.season_reward_info.wild_glint ?? 0;
  const survival = seasonRewards?.season_reward_info.survival_glint ?? 0;

  const showSkeleton = glintLoading && !seasonRewards;
  const showError = !!glintError && !seasonRewards;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography
          variant="h6"
          sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          Glint
          {showError && (
            <Tooltip title={glintError ?? ''}>
              <WarningAmberIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Typography>
        <BalanceItem iconUrl={glint_icon_url} title="Glint" value={largeNumberFormat(glint)} />
        {showSkeleton ? (
          <>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={120} height={24} />
          </>
        ) : (
          <>
            <BalanceItem
              iconUrl={glint_icon_url}
              title="EOS Mordern Glint :"
              value={showError ? '—' : `M: ${largeNumberFormat(modern)}`}
            />
            <BalanceItem
              iconUrl={glint_icon_url}
              title="EOS Wild Glint"
              value={showError ? '—' : `W: ${largeNumberFormat(wild)}`}
            />
            <BalanceItem
              iconUrl={glint_icon_url}
              title="EOS Survival Glint"
              value={showError ? '—' : `S: ${largeNumberFormat(survival)}`}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
