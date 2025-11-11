import { ParsedHistory } from '@/types/parsedHistory';
import { Box, Card, CardContent, Stack, Typography, alpha } from '@mui/material';
import { ListCards } from './ListCards';
import { ListContentSummary } from './ListContentSummary';
import { ListIcon } from './ListIcon';
import { ListPotionsUsed } from './ListPotionsUsed';
import { ListRewardChips } from './ListRewardChips';
import { SplCardDetail } from '@/types/spl/cardDetails';

interface EntryListItemProps {
  entry: ParsedHistory;
  index: number;
  cardDetails?: SplCardDetail[];
}

export function EntryListItem({ entry, cardDetails }: EntryListItemProps) {
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
        <Box>
          <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
            {/* Left: Icon + ContentSummary */}
            <Stack direction="row" spacing={2} alignItems="flex-start" flex={1}>
              <ListIcon entry={entry} />
              <Stack spacing={1}>
                <ListContentSummary entry={entry} />
                <ListRewardChips entry={entry} />
              </Stack>
            </Stack>
            {/* Right: PotionsUsed fills height */}
            <Box display="flex" alignItems="stretch">
              <ListPotionsUsed entry={entry} />
            </Box>
          </Stack>
        </Box>
        <ListCards entry={entry} cardDetails={cardDetails} />
      </CardContent>
    </Card>
  );
}

interface EntryListProps {
  entries: ParsedHistory[];
  cardDetails?: SplCardDetail[];
}

export function EntryList({ entries, cardDetails }: EntryListProps) {
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
        <EntryListItem
          key={`${entry.type}-${index}`}
          entry={entry}
          index={index}
          cardDetails={cardDetails}
        />
      ))}
    </Box>
  );
}
