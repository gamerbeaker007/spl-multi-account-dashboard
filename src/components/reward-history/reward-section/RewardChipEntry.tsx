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
import { findPackIconUrl } from '@/lib/utils';
import {
  ClaimDailyResult,
  ClaimLeagueRewardData,
  ClaimLeagueRewardResult,
  ParsedHistory,
  PotionType,
  PurchaseResult,
  RankedDrawEntry,
  RewardCardDetail,
  RewardDraw,
  RewardItemMerits,
  RewardItemPotion,
  RewardItems,
  RewardItemScroll,
  RewardMerits,
  RewardRankedEntries,
  UnbindScrollData,
  unbindScrollTypeMap,
} from '@/types/parsedHistory';
import { Avatar, Box, capitalize, Chip } from '@mui/material';

interface Props {
  entry: ParsedHistory;
}

interface AggregatedReward {
  type: string;
  quantity: number;
  iconUrl?: string;
  edition?: number;
  card?: RewardCardDetail;
  potion_type?: string;
}

function formatReward(reward: AggregatedReward): string {
  if (reward.card) {
    return `${reward.quantity}x Cards`;
  }
  if (reward.potion_type) {
    const potionType = capitalize(reward.potion_type.toLowerCase());
    const potionInGameName = capitalize(potionType == 'Gold' ? 'Alchemy' : potionType);
    return `${reward.quantity}x ${potionInGameName}`;
  }
  if (!reward.type) return `${reward.quantity}x Unknown Reward`;
  return `${reward.quantity}x ${reward.type
    .replace('_', ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')}`;
}

function getRewardKey(reward: RewardItems): string {
  // Create a unique key for grouping similar rewards
  if (reward.type === 'reward_card') {
    return `card_${reward.card.edition}`;
  }
  if (reward.type === 'potion') {
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

function aggregateRewards(rewards: RewardItems[]): AggregatedReward[] {
  const rewardMap = new Map<string, AggregatedReward>();

  rewards.forEach(reward => {
    const key = getRewardKey(reward);
    const existing = rewardMap.get(key);

    let aggregatedReward: AggregatedReward = {
      type: reward.type,
      quantity: reward.quantity,
    };
    if (existing) {
      // Combine quantities for the same reward type
      existing.quantity += reward.quantity;
    } else {
      // Create new aggregated reward entry
      let iconUrl = '';
      if (reward.type == 'pack') {
        iconUrl = findPackIconUrl(reward.edition);
        aggregatedReward = { ...aggregatedReward, edition: reward.edition };
      } else if (reward.type == 'potion') {
        iconUrl = logoTypeMap[reward.potion_type];
        aggregatedReward = { ...aggregatedReward, potion_type: reward.potion_type };
      } else if (reward.type === 'reward_card') {
        iconUrl = logoTypeMap[reward.type];
        aggregatedReward = { ...aggregatedReward, card: reward.card };
      } else {
        iconUrl = logoTypeMap[reward.type];
      }

      rewardMap.set(key, { ...aggregatedReward, iconUrl });
    }
  });

  return Array.from(rewardMap.values());
}

export const RewardChipEntry = ({ entry }: Props) => {
  const rewards: RewardItems[] = [];
  //check if rewards is league advancement then we should threat the inviducal rewards in the chests
  if (entry.type === 'claim_reward') {
    const leagueEntry = entry.data as ClaimLeagueRewardData;
    if (leagueEntry?.type === 'league') {
      const result = entry.result as ClaimLeagueRewardResult;
      const entryRewards = result.rewards;
      if (entryRewards.minor || entryRewards.major || entryRewards.ultimate) {
        if (entryRewards.minor && entryRewards.minor.result.rewards) {
          rewards.push(...entryRewards.minor.result.rewards);
        }
        if (entryRewards.major && entryRewards.major.result.rewards) {
          rewards.push(...entryRewards.major.result.rewards);
        }
        if (entryRewards.ultimate && entryRewards.ultimate.result.rewards) {
          rewards.push(...entryRewards.ultimate.result.rewards);
        }
      }
    }
  } else if (entry.type === 'claim_daily') {
    const dailyEntry = entry.result as ClaimDailyResult;
    rewards.push(
      ...(Array.isArray(dailyEntry.quest_data.rewards.result.rewards)
        ? dailyEntry.quest_data.rewards.result.rewards
        : [dailyEntry.quest_data.rewards.result.rewards])
    );
  } else if (entry.type === 'purchase') {
    const purchaseEntry = entry.result as PurchaseResult;
    switch (purchaseEntry.type) {
      case 'reward_draw':
        const rewardDrawEntry = purchaseEntry.data as RewardDraw;
        const tempRewardItems: RewardItems[] = Array.isArray(rewardDrawEntry.result.rewards)
          ? rewardDrawEntry.result.rewards
          : [rewardDrawEntry.result.rewards];
        rewards.push(...tempRewardItems);
        break;
      // Handle other sub_types if needed
      case 'reward_merits':
        const rewardMeritsEntry = purchaseEntry.data as RewardMerits;
        const rewardMeritsTemp: RewardItemMerits = {
          type: 'merits',
          quantity: rewardMeritsEntry.amount,
        };
        rewards.push(rewardMeritsTemp);
        break;
      case 'ranked_draw_entry':
        const rankedDrawEntry = purchaseEntry.data as RankedDrawEntry;
        const temp: RewardRankedEntries = {
          type: 'ranked_entries',
          quantity: rankedDrawEntry.result.player_entries,
        };
        rewards.push(temp);
        break;
      case 'potion':
        const potionEntry = purchaseEntry.data as PotionType;
        const potionTemp: RewardItemPotion = {
          type: 'potion',
          potion_type: potionEntry.potion_type,
          quantity: 1,
        };
        rewards.push(potionTemp);
        break;
      case 'unbind_scroll':
        const unbindScrollEntry = purchaseEntry.data as UnbindScrollData;
        const unbindScrollTemp: RewardItemScroll = {
          type: unbindScrollTypeMap[unbindScrollEntry.data.scroll_type] as RewardItemScroll['type'],
          quantity: unbindScrollEntry.qty,
        };
        rewards.push(unbindScrollTemp);
        break;
    }
  }

  const aggregatedRewards = aggregateRewards(rewards);
  if (aggregatedRewards.length === 0 || aggregatedRewards[0].type === undefined) {
    console.warn('No rewards to display for entry:', entry);
  }

  return (
    <Box>
      {aggregatedRewards.map((reward, idx) => (
        <Chip
          key={idx}
          size="small"
          avatar={reward.iconUrl ? <Avatar src={reward.iconUrl} /> : undefined}
          label={formatReward(reward)}
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      ))}
    </Box>
  );
};
