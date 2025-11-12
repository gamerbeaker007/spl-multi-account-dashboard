'use client';

import { EDITION_ICON_MAPPING, EDITION_MAPPING } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { Edition, EditionValues } from '@/types/playerCardCollection';

interface Props {
  editionValues: EditionValues;
}

// Component to render edition breakdown tooltip content
export default function CardEditionDetails({ editionValues }: Props) {
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
            const editionName = EDITION_MAPPING[editionNum] || `Edition ${editionId}`;
            const iconUrl = EDITION_ICON_MAPPING[editionNum];

            return (
              <Box key={editionId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {iconUrl && <Image src={iconUrl} alt={editionName} width={20} height={20} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {editionName}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                    {largeNumberFormat(values.numberOfCards)} cards •{' '}
                    {largeNumberFormat(values.numberOfSellableCards)} sellable cards
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
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
}
