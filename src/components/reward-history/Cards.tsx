'use client';

import { WEB_URL } from '@/lib/staticsIconUrls';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { GiVerticalBanner } from 'react-icons/gi';

interface Props {
  totalCards: {
    [cardId: number]: { edition: number; quantity: number; gold: number; regular: number };
  };
  cardDetails?: SplCardDetail[];
}

//Only card editions that are in the chest rewards
export const cardEditionUrlMap: Record<number, string> = {
  3: 'card_beta',
  10: 'cards_soulbound',
  13: 'cards_soulboundrb',
  15: 'cards_v2.2',
  18: 'cards_v2.2',
};

const iconSize = 150;

const getCardNameById = (cardId: number, cardDetails?: SplCardDetail[]): string => {
  const card = cardDetails?.find(detail => detail.id === Number(cardId));
  return card ? card.name : `Card ${cardId}`;
};

function getFoilSuffix(foil: number): string {
  const FOIL_SUFFIX_MAP: Record<number, string> = {
    0: '',
    1: '_gold',
  };
  return FOIL_SUFFIX_MAP[foil] || '';
}

export function getCardImageUrl(cardName: string, edition: number, foil: number = 0): string {
  const cleanCardName = cardName.trim();
  const encodedName = encodeURIComponent(cleanCardName);

  const foilSuffix = getFoilSuffix(foil);
  const editionMap = cardEditionUrlMap[edition];

  return `${WEB_URL}${editionMap}/${encodedName}${foilSuffix}.jpg`;
}

export function Cards({ totalCards, cardDetails }: Props) {
  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      <Typography variant="h6">Chests</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Gold Rewards
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {Object.entries(totalCards).map(([cardId, cardData]) => {
          const cardName = getCardNameById(Number(cardId), cardDetails);
          if (cardData.gold > 0) {
            const imageUrl = getCardImageUrl(cardName, cardData.edition, 1);
            return (
              <Box key={`${cardId}-gold`} position="relative" flexShrink={0} overflow="hidden">
                <Box
                  position="absolute"
                  top={-15}
                  right={-15}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={1}
                >
                  <GiVerticalBanner size={75} color="red" />
                  <Typography
                    variant="body1"
                    sx={{
                      position: 'absolute',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.0rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {cardData.gold}
                  </Typography>
                </Box>
                <Box
                  position="absolute"
                  bottom={20}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width={'100%'}
                  zIndex={1}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.625rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {cardName}
                  </Typography>
                </Box>

                <Image
                  src={imageUrl}
                  alt={cardName}
                  width={iconSize}
                  height={iconSize}
                  style={{ width: iconSize, height: 'auto' }}
                />
              </Box>
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
          const cardName = getCardNameById(Number(cardId), cardDetails);
          if (cardData.regular > 0) {
            const imageUrl = getCardImageUrl(cardName, cardData.edition, 0);
            return (
              <Box key={`${cardId}-gold`} position="relative" flexShrink={0} overflow="hidden">
                <Box
                  position="absolute"
                  top={-15}
                  right={-15}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={1}
                >
                  <GiVerticalBanner size={75} color="red" />
                  <Typography
                    variant="body1"
                    sx={{
                      position: 'absolute',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.0rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {cardData.regular}
                  </Typography>
                </Box>
                <Box
                  position="absolute"
                  bottom={20}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width={'100%'}
                  zIndex={1}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.625rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {cardName}
                  </Typography>
                </Box>
                <Image
                  src={imageUrl}
                  alt={cardName}
                  width={iconSize}
                  height={iconSize}
                  style={{ width: iconSize, height: 'auto' }}
                />
              </Box>
            );
          }
          return null;
        })}
      </Box>
    </Box>
  );
}
