import { PlayerCardCollectionData } from '@/hooks/usePlayerCardCollection';
import { Edition, EditionValues } from '@/lib/collectionUtils';
import {
  EDITION_ICON_MAPPING,
  EDITION_MAPPING,
  hammer_icon_url,
} from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { AiFillDollarCircle } from 'react-icons/ai';
import { TbCards } from 'react-icons/tb';
import { BalanceItem } from './BalanceItem';

// Component to render edition breakdown tooltip content
const EditionTooltipContent = ({
  editionValues,
}: {
  editionValues: EditionValues;
}) => {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Card Collection by Edition
      </Typography>
      <Stack spacing={1}>
        {Object.entries(editionValues)
          .filter(([, values]) => values.numberOfCards > 0) // Only show editions with cards
          .sort(([a], [b]) => Number(a) - Number(b)) // Sort by edition number
          .map(([editionId, values]) => {
            const editionNum = Number(editionId) as Edition;
            const editionName =
              EDITION_MAPPING[editionNum] || `Edition ${editionId}`;
            const iconUrl = EDITION_ICON_MAPPING[editionNum];

            return (
              <Box
                key={editionId}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt={editionName}
                    width={20}
                    height={20}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {editionName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', opacity: 0.9 }}
                  >
                    {largeNumberFormat(values.numberOfCards)} cards •{' '}
                    {largeNumberFormat(values.numberOfSellableCards)} sellable
                    cards
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', opacity: 0.9 }}
                  >
                    List: ${largeNumberFormat(values.listValue)} • Market: $
                    {largeNumberFormat(values.marketValue)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
      </Stack>
    </Box>
  );
};

interface Props {
  cardData?: PlayerCardCollectionData;
  cardDataLoading?: boolean;
  cardDataError?: string | null;
}

export default function CardCollection({
  cardData,
  cardDataLoading,
  cardDataError,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  // Extract balance values
  if (cardDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (cardDataError) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">Error: {cardDataError}</Typography>
      </Box>
    );
  }

  if (!cardData) {
    return null;
  }
  const collectionPower = cardData?.collectionPower || 0;
  const totalMarketValue =
    cardData?.playerCollectionValue.totalMarketValue || 0;
  const totalListValue = cardData?.playerCollectionValue.totalListValue || 0;
  const totalNumberOfCards =
    cardData?.playerCollectionValue.totalNumberOfCards || 0;
  const totalNumberOfSellableCards =
    cardData?.playerCollectionValue.totalSellableCards || 0;

  return (
    <>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ width: '100%' }}>
              Card Collection
            </Typography>
            <IconButton
              size="small"
              onClick={handleOpenDialog}
              sx={{ color: 'primary.main' }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
          <BalanceItem
            iconUrl={hammer_icon_url}
            title="Hammer"
            value={largeNumberFormat(collectionPower)}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <BalanceItem
              iconUrl={<TbCards />}
              title="Hammer"
              value={`${largeNumberFormat(totalNumberOfCards)}`}
            />
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              - Cards
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <BalanceItem
              iconUrl={<TbCards />}
              title="Hammer"
              value={`${largeNumberFormat(totalNumberOfSellableCards)}`}
            />
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              - Sellable Cards
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <BalanceItem
              iconUrl={<AiFillDollarCircle color="green" />}
              title="USD"
              value={largeNumberFormat(totalListValue)}
            />
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              - List Value
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <BalanceItem
              iconUrl={<AiFillDollarCircle color="green" />}
              title="USD"
              value={largeNumberFormat(totalMarketValue)}
            />
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              - Market Value
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Card Collection by Edition
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <EditionTooltipContent
            editionValues={cardData.playerCollectionValue.editionValues}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
