import {
  ClaimDailyResult,
  ClaimLeagueRewardResult,
  ParsedHistory,
  PurchaseResult,
  RewardDraw,
  RewardItemCard,
} from '@/types/parsedHistory';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { Card } from '../Card';

interface Props {
  entry: ParsedHistory;
  cardDetails?: SplCardDetail[];
}

export const ListCards = ({ entry, cardDetails }: Props) => {
  const rewards: RewardItemCard[] = [];

  switch (entry.type) {
    case 'purchase':
      const purchaseEntry = entry.result as PurchaseResult;
      if (purchaseEntry.type === 'reward_draw') {
        const temp = purchaseEntry.data as RewardDraw;
        temp.result?.rewards.forEach(reward => {
          if (reward.type === 'reward_card') rewards.push(reward);
        });
      }
      break;
    case 'claim_daily':
      const claimDailyEntry = entry.result as ClaimDailyResult;
      claimDailyEntry.quest_data.rewards.result.rewards.forEach(reward => {
        if (reward.type === 'reward_card') rewards.push(reward);
      });
      break;
    case 'claim_reward':
      if (!entry.result) break; // season league rewards do not has result
      const claimRewardEntry = entry.result as ClaimLeagueRewardResult;
      claimRewardEntry.rewards.minor?.result?.rewards.forEach(reward => {
        if (reward.type === 'reward_card') rewards.push(reward);
      });
      claimRewardEntry.rewards.major?.result?.rewards.forEach(reward => {
        if (reward.type === 'reward_card') rewards.push(reward);
      });
      claimRewardEntry.rewards.ultimate?.result?.rewards.forEach(reward => {
        if (reward.type === 'reward_card') rewards.push(reward);
      });
      break;
  }

  const hasCards = rewards.length > 0;
  if (!hasCards) return null;

  const groupedCards = rewards.reduce(
    (grouped, reward) => {
      const key = `${reward.card.card_detail_id}-${reward.card.edition}-${reward.card.foil}`;
      if (!grouped[key]) {
        grouped[key] = {
          type: reward.type,
          card: reward.card,
          quantity: reward.quantity,
        };
      } else {
        grouped[key].quantity += reward.quantity;
      }
      return grouped;
    },
    {} as Record<string, RewardItemCard>
  );

  const goldCards = Object.values(groupedCards).filter(cards => cards.card.foil);
  const regularCards = Object.values(groupedCards).filter(cards => !cards.card.foil);

  return (
    <>
      {hasCards && (
        <Box>
          <Accordion>
            <AccordionSummary
              expandIcon={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      border: 'solid #888',
                      borderWidth: '0 3px 3px 0',
                      padding: 4,
                      transform: 'rotate(45deg)',
                      marginRight: 8,
                    }}
                  />
                </Box>
              }
            >
              <Typography variant="h6" color="secondary.main">
                Cards:{' '}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" flexDirection="column" gap={4}>
                {goldCards.length > 0 && (
                  <Box minWidth={220} display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Gold Cards</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {goldCards.map(card => (
                        <Card
                          key={card.card.card_detail_id}
                          rewardItemCard={card}
                          cardDetails={cardDetails}
                          zoom={'65%'}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {regularCards.length > 0 && (
                  <Box minWidth={220} display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Regular Cards</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {regularCards.map(card => (
                        <Card
                          key={card.card.card_detail_id}
                          rewardItemCard={card}
                          cardDetails={cardDetails}
                          zoom={'65%'}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </>
  );
};
