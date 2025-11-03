'use client';

import { WEB_URL } from '@/lib/staticsIconUrls';
import { RewardItemCard } from '@/types/parsedHistory';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { GiVerticalBanner } from 'react-icons/gi';

interface Props {
  rewardItemCard: RewardItemCard;
  cardDetails?: SplCardDetail[];
  zoom?: string;
}

//Only card editions that are in the chest rewards
const cardEditionUrlMap: Record<number, string> = {
  3: 'card_beta',
  10: 'cards_soulbound',
  13: 'cards_soulboundrb',
  15: 'cards_v2.2',
  18: 'cards_v2.2',
};

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

function getCardImageUrl(cardName: string, edition: number, foil: number = 0): string {
  const cleanCardName = cardName.trim();
  const encodedName = encodeURIComponent(cleanCardName);

  const foilSuffix = getFoilSuffix(foil);
  const editionMap = cardEditionUrlMap[edition];

  return `${WEB_URL}${editionMap}/${encodedName}${foilSuffix}.jpg`;
}

const iconSize = 140;

export function Card({ rewardItemCard, cardDetails, zoom = '100%' }: Props) {
  const card = rewardItemCard.card;
  const cardName = getCardNameById(card.card_detail_id, cardDetails);
  const imageUrl = getCardImageUrl(cardName, card.edition, card.foil);
  const quantity = rewardItemCard.quantity;

  return (
    <Box position="relative" flexShrink={0} overflow="hidden" sx={{ zoom: zoom }}>
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
          {quantity}x
        </Typography>
      </Box>
      <Box
        position="absolute"
        bottom={30}
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
            fontSize: '0.8rem',
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
        style={{ width: 'auto', height: 'auto' }}
      />
    </Box>
  );
}
