'use client';

import CardEditionDetails from '@/components/CardEditionDetails';
import { useUsernameContext } from '@/contexts/UsernameContext';
import { usePlayerCardCollection } from '@/hooks/usePlayerCardCollection';
import { hammer_icon_url } from '@/lib/staticsIconUrls';
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
import { useEffect, useState } from 'react';
import { AiFillDollarCircle } from 'react-icons/ai';
import { TbCards } from 'react-icons/tb';
import { BalanceItem } from './BalanceItem';

interface Props {
  username: string;
}

export default function CardCollection({ username }: Props) {
  const { data, loading, error, refetch } = usePlayerCardCollection(username);
  const { refreshTrigger } = useUsernameContext();

  // Fetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch when refresh button is clicked
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  const collectionPower = data?.collectionPower || 0;
  const totalMarketValue = data?.playerCollectionValue.totalMarketValue || 0;
  const totalListValue = data?.playerCollectionValue.totalListValue || 0;
  const totalNumberOfCards = data?.playerCollectionValue.totalNumberOfCards || 0;
  const totalNumberOfSellableCards = data?.playerCollectionValue.totalSellableCards || 0;

  return (
    <>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ width: '100%' }}>
              Card Collection
            </Typography>
            <IconButton size="small" onClick={handleOpenDialog} sx={{ color: 'primary.main' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
            {loading && <CircularProgress size={12} sx={{ ml: 0.5 }} />}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
          {data && <CardEditionDetails editionValues={data.playerCollectionValue.editionValues} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
