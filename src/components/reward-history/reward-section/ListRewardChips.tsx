import { glint_icon_url } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import {
  ClaimLeagueRewardData,
  ClaimSeasonLeagueRewardData,
  ClaimSeasonLeagueRewardResult,
  ParsedHistory,
} from '@/types/parsedHistory';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { RewardChipEntry } from './RewardChipEntry';

interface Props {
  entry: ParsedHistory;
}

export const ListRewardChips = ({ entry }: Props) => {
  const isSeasonReward =
    entry.type === 'claim_reward' &&
    (entry.data as ClaimLeagueRewardData | ClaimSeasonLeagueRewardData)?.type === 'league_season';

  const seasonEntryResult = isSeasonReward ? (entry.result as ClaimSeasonLeagueRewardResult) : null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        Rewards:
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
        {!isSeasonReward ? (
          <RewardChipEntry entry={entry} />
        ) : (
          <>
            <Chip
              size="small"
              avatar={<Avatar src={glint_icon_url} />}
              label={`${largeNumberFormat(seasonEntryResult?.rewards || 0)}  `}
              sx={{ mr: 0.5, mb: 0.5 }}
            />
            {seasonEntryResult?.affiliate_rewards ||
              (0 > 0 && (
                <Chip
                  size="small"
                  avatar={<Avatar src={glint_icon_url} />}
                  label={`${largeNumberFormat(seasonEntryResult?.affiliate_rewards || 0)}  `}
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
          </>
        )}
      </Stack>
    </Box>
  );
};
