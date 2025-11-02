'use client';

import {
  energy_icon_url,
  findLeagueLogoUrl,
  foundation_entries_icon_url,
  glint_icon_url,
  merits_icon_url,
  ranked_entries_icon_url,
  reward_draw_common_icon_url,
  reward_draw_epic_icon_url,
  reward_draw_legendary_icon_url,
  reward_draw_major_icon_url,
  reward_draw_minor_icon_url,
  reward_draw_rare_icon_url,
} from '@/lib/staticsIconUrls';
import { SplFormat } from '@/types/spl/format';
import { ParsedHistoryEntry, ParsedPurchaseEntry } from '@/types/spl/parsedHistory';
import { Avatar } from '@mui/material';

interface Props {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
}

const iconTypeMap: Record<string, string> = {
  minor_draw: reward_draw_minor_icon_url,
  major_draw: reward_draw_major_icon_url,
  ultimate_draw: reward_draw_legendary_icon_url,
  common_draw: reward_draw_common_icon_url,
  rare_draw: reward_draw_rare_icon_url,
  epic_draw: reward_draw_epic_icon_url,
  legendary_draw: reward_draw_legendary_icon_url,
  ranked_draw_entry: ranked_entries_icon_url,
  reward_merits: merits_icon_url,
  reward_energy: energy_icon_url,
};

const iconQuestMap: Record<string, string> = {
  wild: ranked_entries_icon_url,
  modern: ranked_entries_icon_url,
  foundation: foundation_entries_icon_url,
};

export const ListIcon = ({ entry }: Props) => {
  let url = 'Unknown Icon';

  switch (entry.type) {
    case 'purchase':
      const purchaseEntry = entry as ParsedPurchaseEntry;
      url = iconTypeMap[purchaseEntry.subType ?? 'unknown'] || 'Default Purchase Icon';
      break;
    case 'claim_daily':
      const dailyEntry = entry as ParsedHistoryEntry;

      url = iconQuestMap[dailyEntry.questName ?? 'unknown'] || 'Default Daily Quest Icon';
      break;
    case 'claim_reward':
      const claimRewardEntry = entry as ParsedHistoryEntry;
      if (claimRewardEntry.metaData?.type === 'league_season') {
        url = glint_icon_url;
      } else {
        url =
          findLeagueLogoUrl(
            (claimRewardEntry.metaData?.format as SplFormat) || 'wild',
            claimRewardEntry.metaData?.tier || 0
          ) || 'Default Reward Icon';
      }
      break;
  }

  return (
    <Avatar
      src={url}
      sx={{
        width: 48,
        height: 48,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
  );
};
