'use client';

import { ParsedHistoryEntry, ParsedPurchaseEntry } from '@/types/spl/parsedHistory';
import { Box, Card, CardContent, Stack, Typography, alpha } from '@mui/material';
import { ListContentSummary } from './ListContentSummary';
import { ListIcon } from './ListIcon';
import { ListRewardChips } from './ListRewardChips';

interface EntryListItemProps {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
  index: number;
}

export function EntryListItem({ entry }: EntryListItemProps) {
  return (
    <Card
      sx={{
        mb: 1,
        '&:hover': {
          boxShadow: 3,
          bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <ListIcon entry={entry} />
          <ListContentSummary entry={entry} />
        </Stack>
        <Box>
          <ListRewardChips entry={entry} />
        </Box>
        {/* TODO detail cards */}
      </CardContent>
    </Card>
  );
}

interface EntryListProps {
  entries: (ParsedHistoryEntry | ParsedPurchaseEntry)[];
}

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">No entries to display</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {entries.map((entry, index) => (
        <EntryListItem key={`${entry.type}-${index}`} entry={entry} index={index} />
      ))}
    </Box>
  );
}
