'use client';
import { CardDetail } from '@/types/card';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  player: string;
  name: string;
  imageUrl: string;
  subTitle: string;
  allCards?: CardDetail[];
  opacity?: number;
  priority?: boolean;
}

// Fixed dimensions for card images to prevent layout shift
const CARD_WIDTH = 150;
const CARD_HEIGHT = 240;
const SCALED_WIDTH = CARD_WIDTH * 0.8;
const SCALED_HEIGHT = CARD_HEIGHT * 0.8;

export const Card = ({
  player,
  name,
  imageUrl,
  subTitle,
  allCards,
  opacity = 1,
  priority = false,
}: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.warn(`Failed to load image: ${imageUrl}`);
    setImageError(true);
    setImageLoaded(true); // Hide skeleton even on error
  };

  // Group cards by player and level
  const groupCards = (cards: CardDetail[]) => {
    const grouped = new Map<
      string,
      { player: string; level: number; bcx: number; count: number }
    >();

    cards.forEach(card => {
      const key = `${card.owner}-${card.level}`;
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.count += 1;
        existing.bcx = card.bcx;
      } else {
        grouped.set(key, {
          player: card.owner,
          level: card.level,
          bcx: card.bcx,
          count: 1,
        });
      }
    });

    // Sort by level descending (highest first)
    return Array.from(grouped.values()).sort((a, b) => b.level - a.level);
  };

  const owned = allCards ? groupCards(allCards.filter(p => p.owner === player)) : [];
  const delegatedCards = allCards ? groupCards(allCards.filter(p => p.owner !== player)) : [];

  return (
    <Tooltip
      title={
        allCards && allCards.length > 0 ? (
          <Box>
            {owned.length > 0 && (
              <>
                <Typography variant="body2" fontWeight="bold" mb={0.5}>
                  Owned:
                </Typography>
                {owned.map((card, index) => (
                  <Typography key={index} variant="body2">
                    • Level {card.level} - CC {card.bcx} {card.count > 1 ? `(x${card.count})` : ''}
                  </Typography>
                ))}
              </>
            )}
            {delegatedCards.length > 0 && (
              <>
                <Typography variant="body2" fontWeight="bold" mb={0.5}>
                  Delegated by:
                </Typography>
                {delegatedCards.map((card, index) => (
                  <Typography key={index} variant="body2">
                    • {card.player} - Level {card.level} - CC {card.bcx}{' '}
                    {card.count > 1 ? `(x${card.count})` : ''}
                  </Typography>
                ))}
              </>
            )}
          </Box>
        ) : (
          ''
        )
      }
      arrow
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={1}
        sx={{ opacity: opacity }}
      >
        <Box
          sx={{
            width: SCALED_WIDTH,
            height: SCALED_HEIGHT,
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          <Image
            src={imageUrl}
            alt={name}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes="120px"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            style={{
              width: SCALED_WIDTH,
              height: SCALED_HEIGHT,
              objectFit: 'contain',
            }}
          />
          {!imageLoaded && !imageError && (
            <Skeleton
              variant="rectangular"
              width={SCALED_WIDTH}
              height={SCALED_HEIGHT}
              animation="wave"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            />
          )}
          {imageError && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: SCALED_WIDTH,
                height: SCALED_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'error.dark',
                color: 'error.contrastText',
                fontSize: '0.75rem',
                textAlign: 'center',
                padding: 1,
              }}
            >
              <Typography variant="body2">{name}</Typography>
              <Typography variant="body2">Image not found</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="body1" sx={{ mt: 0.5 }}>
          {subTitle}
        </Typography>
      </Box>
    </Tooltip>
  );
};
