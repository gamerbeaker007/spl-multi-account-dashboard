import {
  energy_icon_url,
  foundation_entries_icon_url,
  glint_icon_url,
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  ranked_entries_icon_url,
  reward_draw_common_icon_url,
  reward_draw_epic_icon_url,
  reward_draw_legendary_icon_url,
  reward_draw_major_icon_url,
  reward_draw_minor_icon_url,
  reward_draw_rare_icon_url,
  unbind_ca_c_icon_url,
  unbind_ca_e_icon_url,
  unbind_ca_l_icon_url,
  unbind_ca_r_icon_url,
} from '@/lib/staticsIconUrls';
import { findLeagueLogoUrl } from '@/lib/utils';
import {
  ClaimDailyResult,
  ClaimLeagueRewardData,
  ClaimSeasonLeagueRewardData,
  ParsedHistory,
  PotionType,
  PurchaseResult,
  UnbindScrollData,
  unbindScrollTypeMap,
} from '@/types/parsedHistory';
import { SplFormat } from '@/types/spl/format';
import { Avatar } from '@mui/material';

interface Props {
  entry: ParsedHistory;
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
  gold: gold_icon_url,
  legendary: legendary_icon_url,
  common_scroll: unbind_ca_c_icon_url,
  rare_scroll: unbind_ca_r_icon_url,
  epic_scroll: unbind_ca_e_icon_url,
  legendary_scroll: unbind_ca_l_icon_url,
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
      const purchaseEntry = entry.result as PurchaseResult;
      let findType = purchaseEntry.sub_type || (purchaseEntry.type as string);
      if (findType === 'potion') {
        const temp = purchaseEntry.data as PotionType;
        findType = temp.potion_type.toLowerCase();
      } else if (findType === 'unbind_scroll') {
        const temp = purchaseEntry.data as UnbindScrollData;
        findType = unbindScrollTypeMap[temp.data.scroll_type];
      }
      url = iconTypeMap[findType] || 'Default Purchase Icon';
      break;
    case 'claim_daily':
      const dailyEntry = entry.result as ClaimDailyResult;

      url = iconQuestMap[dailyEntry.quest_data?.name ?? 'unknown'] || 'Default Daily Quest Icon';
      break;
    case 'claim_reward':
      const claimRewardEntry = entry.data as ClaimLeagueRewardData | ClaimSeasonLeagueRewardData;
      if (claimRewardEntry.type === 'league_season') {
        url = glint_icon_url;
      } else {
        url =
          findLeagueLogoUrl(
            (claimRewardEntry.format as SplFormat) || 'wild',
            claimRewardEntry.tier || 0
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
