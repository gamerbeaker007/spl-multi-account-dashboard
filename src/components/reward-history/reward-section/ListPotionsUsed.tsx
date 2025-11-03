'use client';

import { gold_icon_url, legendary_icon_url } from '@/lib/staticsIconUrls';
import {
  ClaimDailyResult,
  ClaimLeagueRewardResult,
  ParsedHistory,
  PotionUsed,
  PurchaseResult,
  RewardDraw,
} from '@/types/parsedHistory';
import { Avatar, Box, Typography } from '@mui/material';

interface Props {
  entry: ParsedHistory;
}

export const ListPotionsUsed = ({ entry }: Props) => {
  const potionUsed: PotionUsed = {
    legendary: {
      charges_used: 0,
    },
    gold: {
      charges_used: 0,
    },
  };

  switch (entry.type) {
    case 'purchase':
      const purchaseEntry = entry.result as PurchaseResult;
      if (purchaseEntry.type === 'reward_draw') {
        const temp = purchaseEntry.data as RewardDraw;
        potionUsed.gold.charges_used = temp.result?.potions?.gold?.charges_used || 0;
        potionUsed.legendary.charges_used = temp.result?.potions?.legendary?.charges_used || 0;
      }
      break;
    case 'claim_daily':
      const claimDailyEntry = entry.result as ClaimDailyResult;
      potionUsed.gold.charges_used = claimDailyEntry.potions?.gold.charges_used || 0;
      potionUsed.legendary.charges_used = claimDailyEntry.potions?.legendary.charges_used || 0;
      break;
    case 'claim_reward':
      if (!entry.result) break; // season league rewards do not has result
      const claimRewardEntry = entry.result as ClaimLeagueRewardResult;
      potionUsed.gold.charges_used =
        claimRewardEntry.rewards.minor?.result?.potions?.gold?.charges_used || 0;
      potionUsed.legendary.charges_used =
        claimRewardEntry.rewards.minor?.result?.potions?.legendary?.charges_used || 0;
      potionUsed.gold.charges_used +=
        claimRewardEntry.rewards.major?.result?.potions?.gold?.charges_used || 0;
      potionUsed.legendary.charges_used +=
        claimRewardEntry.rewards.major?.result?.potions?.legendary?.charges_used || 0;
      potionUsed.gold.charges_used +=
        claimRewardEntry.rewards.ultimate?.result?.potions?.gold?.charges_used || 0;
      potionUsed.legendary.charges_used +=
        claimRewardEntry.rewards.ultimate?.result?.potions?.legendary?.charges_used || 0;
      break;
  }

  const hasPotionsUsed = potionUsed.gold.charges_used > 0 || potionUsed.legendary.charges_used > 0;

  return (
    <>
      {hasPotionsUsed && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {' '}
            Potions Used
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar
              src={gold_icon_url}
              sx={{
                width: 30,
                height: 30,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>{potionUsed.gold.charges_used}x</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar
              src={legendary_icon_url}
              sx={{
                width: 30,
                height: 30,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>{potionUsed.legendary.charges_used}x</strong>
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};
