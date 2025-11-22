'use client';
import { useCardFilter } from '@/contexts/CardFilterContext';
import { SplCardDetail } from '@/types/spl/cardDetails';

import { getCardImg } from '@/lib/collectionUtils';
import { CardFoil, cardFoilOptions, editionMap } from '@/types/card';
import { SplPlayerCard } from '@/types/spl/card';
import { Box, Typography } from '@mui/material';
import { Card } from './Card';

interface CardSectionProps {
  username: string;
  cardDetails: SplCardDetail[];
  playerCards: SplPlayerCard[];
}

export const CardSection = ({ username, cardDetails, playerCards }: CardSectionProps) => {
  const { filterCard, selectedSets, hideMissingCards } = useCardFilter();

  const combinedCollection = cardDetails.reduce(
    (acc, card) => {
      const key = card.id;
      const playerCard = playerCards.filter(pc => {
        return pc.card_detail_id === card.id;
      });

      if (!acc[key]) {
        acc[key] = {
          card_detail_id: card.id,
          cardDetail: card,
          cards: playerCard,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        card_detail_id: number;
        cardDetail: SplCardDetail;
        cards?: SplPlayerCard[];
      }
    >
  );

  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Typography variant="h6" color="text.secondary" gutterBottom>
        CARDS:
      </Typography>
      <Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'}>
        {Object.values(combinedCollection).map((collection, collectionIndex) => {
          const detail = cardDetails.find(d => d.id === collection.card_detail_id);
          if (!detail) return null;

          // Apply all filters to determine if this card should be shown at all
          const passesFilter = filterCard(
            detail.editions.split(',').map(e => Number(e))[0], // Use first edition for filter check
            detail.rarity,
            detail.color.toLowerCase(),
            detail.secondary_color ? detail.secondary_color.toLowerCase() : null
          );

          // Skip this card entirely if it doesn't pass filters
          if (!passesFilter) return null;

          const editions = detail.editions.split(',').map(e => Number(e));
          //remove edtions that are not in the filter
          const validEditions = editions.filter(editionId => {
            if (selectedSets.length === 0) return true;
            if (editionId === 9 || editionId === 11) return false;
            const editionInfo = editionMap[editionId];
            if (!editionInfo || !editionInfo.setName) return false;
            return selectedSets.includes(editionInfo.setName);
          });

          // Group player cards by edition and foil
          const cardsByEditionAndFoil = collection.cards?.reduce(
            (acc, pc) => {
              // Apply filters
              if (
                !filterCard(
                  pc.edition,
                  detail.rarity,
                  detail.color.toLowerCase(),
                  detail.secondary_color ? detail.secondary_color.toLowerCase() : null
                )
              )
                return acc;

              const key = `${pc.edition}-${pc.foil}`;
              if (!acc[key]) {
                acc[key] = {
                  edition: pc.edition,
                  foil: cardFoilOptions[pc.foil],
                  count: 0,
                  highest_level: 0,
                  cards: [],
                };
              }
              acc[key].count += 1;
              acc[key].highest_level = Math.max(acc[key].highest_level, pc.level || 0);
              acc[key].cards.push(pc);
              return acc;
            },
            {} as Record<
              string,
              {
                edition: number;
                foil: CardFoil;
                count: number;
                highest_level: number;
                cards: SplPlayerCard[];
              }
            >
          );

          // Render cards
          if (cardsByEditionAndFoil && Object.keys(cardsByEditionAndFoil).length > 0) {
            // Render owned cards grouped by edition and foil
            return Object.values(cardsByEditionAndFoil).map((cardGroup, groupIndex) => {
              const imageUrl = getCardImg(
                detail.name,
                cardGroup.edition,
                cardGroup.foil,
                cardGroup.highest_level
              );

              return (
                <Card
                  key={`${collection.card_detail_id}-${cardGroup.edition}-${cardGroup.foil}`}
                  player={username}
                  name={detail.name}
                  imageUrl={imageUrl}
                  subTitle={`(Lvl ${cardGroup.highest_level}) - x${cardGroup.count}`}
                  allCards={cardGroup.cards}
                  priority={collectionIndex < 8 && groupIndex === 0}
                />
              );
            });
          } else {
            // Skip missing cards if hideMissingCards is enabled
            if (hideMissingCards) return null;

            // Render missing cards for each edition
            return validEditions.map(editionId => {
              return (
                <Card
                  key={`${collection.card_detail_id}-missing-${editionId}`}
                  player={username}
                  name={detail.name}
                  imageUrl={getCardImg(detail.name, editionId, 'regular', 0)}
                  subTitle="(Missing)"
                  opacity={0.3}
                  priority={collectionIndex < 8}
                />
              );
            });
          }
        })}
      </Box>
    </Box>
  );
};
