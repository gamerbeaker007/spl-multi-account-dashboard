'use client';

import {
  energy_icon_url,
  foundation_entries_icon_url,
  glint_icon_url,
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  ranked_entries_icon_url,
  reward_draw_major_icon_url,
  unbind_ca_c_icon_url,
  unbind_ca_e_icon_url,
  unbind_ca_l_icon_url,
  unbind_ca_r_icon_url,
} from '@/lib/staticsIconUrls';
import { findPackIconUrl, largeNumberFormat } from '@/lib/utils';
import { ParsedHistoryEntry, ParsedPurchaseEntry, ParsedReward } from '@/types/spl/parsedHistory';
import { Avatar, Box, capitalize, Chip, Stack, Typography } from '@mui/material';

interface Props {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
}

interface AggregatedReward {
  type: string;
  quantity: number;
  iconUrl: string | null;
  label: string;
  edition?: number;
  card?: ParsedReward['card'];
  potion_type?: string;
}

function formatReward(reward: ParsedReward): string {
  if (reward.card) {
    return `${reward.quantity}x Cards`;
  }
  if (reward.potion_type) {
    const potionTypeCapitalized = capitalize(
      reward.potion_type == 'gold' ? 'Alchemy' : reward.potion_type
    );
    return `${reward.quantity}x ${potionTypeCapitalized}`;
  }
  if (!reward.type) return `${reward.quantity}x Unknown Reward`;
  return `${reward.quantity}x ${reward.type
    .replace('_', ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')}`;
}

function getRewardKey(reward: ParsedReward): string {
  // Create a unique key for grouping similar rewards
  if (reward.card) {
    return `card_${reward.card.edition}`;
  }
  if (reward.potion_type) {
    return `potion_${reward.potion_type}`;
  }
  if (reward.type == 'pack') {
    return `pack_${reward.edition}`;
  }
  return reward.type;
}

const logoTypeMap: { [key: string]: string } = {
  gold: gold_icon_url,
  legendary: legendary_icon_url,
  merits: merits_icon_url,
  reward_merits: merits_icon_url,
  reward_card: reward_draw_major_icon_url,
  ranked_entries: ranked_entries_icon_url,
  frontier_entries: foundation_entries_icon_url,
  energy: energy_icon_url,
  common_scroll: unbind_ca_c_icon_url,
  rare_scroll: unbind_ca_r_icon_url,
  epic_scroll: unbind_ca_e_icon_url,
  legendary_scroll: unbind_ca_l_icon_url,
  card: reward_draw_major_icon_url,
  glint: glint_icon_url,
};

function aggregateRewards(rewards: ParsedReward[]): AggregatedReward[] {
  const rewardMap = new Map<string, AggregatedReward>();

  rewards.forEach(reward => {
    const key = getRewardKey(reward);
    const existing = rewardMap.get(key);

    if (existing) {
      // Combine quantities for the same reward type
      existing.quantity += reward.quantity;
    } else {
      // Create new aggregated reward entry
      let iconUrl = '';
      if (reward.type == 'pack') {
        iconUrl = findPackIconUrl(String(reward.edition));
      } else if (reward.potion_type) {
        iconUrl = logoTypeMap[reward.potion_type];
      } else {
        iconUrl = logoTypeMap[reward.type];
      }

      rewardMap.set(key, {
        type: reward.type,
        quantity: reward.quantity,
        edition: reward.edition,
        iconUrl,
        label: '', // Will be set by formatReward
        card: reward.card,
        potion_type: reward.potion_type,
      });
    }
  });

  return Array.from(rewardMap.values());
}

export const ListRewardChips = ({ entry }: Props) => {
  const isSeasonReward =
    entry.type === 'claim_reward' &&
    (entry as ParsedHistoryEntry).metaData?.type === 'league_season';

  let rewards: ParsedReward[] = [];

  //check if rewards is league advancement then we should threat the inviducal rewards in the chests
  if (entry.type === 'claim_reward') {
    const leagueEntry = entry as ParsedHistoryEntry;
    if (leagueEntry.metaData?.type === 'league') {
      const reward = leagueEntry.rewards as ParsedReward;
      if (reward.minor || reward.major || reward.ultimate) {
        if (reward.minor && reward.minor.result.rewards) {
          rewards.push(...reward.minor.result.rewards);
        }
        if (reward.major && reward.major.result.rewards) {
          rewards.push(...reward.major.result.rewards);
        }
        if (reward.ultimate && reward.ultimate.result.rewards) {
          rewards.push(...reward.ultimate.result.rewards);
        }
      }
    } else {
      if (entry.rewards) {
        rewards = Array.isArray(entry.rewards) ? entry.rewards : [entry.rewards];
      }
    }
  } else {
    if (entry.rewards) {
      rewards = Array.isArray(entry.rewards) ? entry.rewards : [entry.rewards];
    }
  }

  const aggregatedRewards = aggregateRewards(rewards);
  if (
    !isSeasonReward &&
    (aggregatedRewards.length === 0 || aggregatedRewards[0].type === undefined)
  ) {
    console.warn('No rewards to display for entry:', entry);
  }

  return (
    <>
      {/* Rewards */}
      {rewards.length > 0 && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Rewards ({rewards.length}):
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {!isSeasonReward ? (
              <>
                {aggregatedRewards.map((reward, idx) => (
                  <Chip
                    key={idx}
                    avatar={reward.iconUrl ? <Avatar src={reward.iconUrl} /> : undefined}
                    label={formatReward(reward)}
                  />
                ))}
              </>
            ) : (
              <>
                <Chip
                  avatar={<Avatar src={logoTypeMap['glint']} />}
                  label={`${largeNumberFormat((entry as ParsedHistoryEntry).metaData?.rewards || 0)}  `}
                />
                {(entry as ParsedHistoryEntry).metaData?.affiliate_rewards ||
                  (0 > 0 && (
                    <Chip
                      avatar={<Avatar src={logoTypeMap['glint']} />}
                      label={`${largeNumberFormat((entry as ParsedHistoryEntry).metaData?.affiliate_rewards || 0)}  `}
                    />
                  ))}
              </>
            )}
          </Stack>
        </Box>
      )}
    </>
  );
};
