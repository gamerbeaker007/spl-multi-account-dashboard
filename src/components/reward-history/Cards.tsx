import { RewardItemCard } from '@/types/parsedHistory';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { Box, Typography } from '@mui/material';
import { Card } from './Card';

interface Props {
  totalCards: {
    [cardId: number]: { edition: number; quantity: number; gold: number; regular: number };
  };
  cardDetails?: SplCardDetail[];
}

export function Cards({ totalCards, cardDetails }: Props) {
  const isEmpty = Object.keys(totalCards).length === 0;
  if (isEmpty) return null;

  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      <Typography variant="h6">Chests</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Gold Rewards
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {Object.entries(totalCards).map(([cardId, cardData]) => {
          if (cardData.gold > 0) {
            const rewardItemCard: RewardItemCard = {
              type: 'reward_card',
              card: {
                card_detail_id: Number(cardId),
                edition: cardData.edition,
                foil: 1,
                gold: true,
                xp: 0, // not used here
              },
              quantity: cardData.gold,
            };

            return (
              <Card
                key={`${cardId}-gold`}
                rewardItemCard={rewardItemCard}
                cardDetails={cardDetails}
              />
            );
          }
          return null;
        })}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Regular Rewards
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {Object.entries(totalCards).map(([cardId, cardData]) => {
          if (cardData.regular > 0) {
            const rewardItemCard: RewardItemCard = {
              type: 'reward_card',
              card: {
                card_detail_id: Number(cardId),
                edition: cardData.edition,
                foil: 0,
                gold: false,
                xp: 0, // not used here
              },
              quantity: cardData.regular,
            };

            return (
              <Card
                key={`${cardId}-regular`}
                rewardItemCard={rewardItemCard}
                cardDetails={cardDetails}
              />
            );
          }
          return null;
        })}
      </Box>
    </Box>
  );
}
