'use client';

import { leagueNames } from '@/lib/utils';
import { ParsedHistoryEntry, ParsedPurchaseEntry } from '@/types/spl/parsedHistory';
import { Box, capitalize, Chip, Stack, Typography } from '@mui/material';

interface Props {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
}

const PURCHASE_TYPE_LABELS: Record<string, string> = {
  minor_draw: 'Minor Draw Purchase',
  major_draw: 'Major Draw Purchase',
  ultimate_draw: 'Ultimate Draw Purchase',
  common_draw: 'Common Draw Purchase',
  rare_draw: 'Rare Draw Purchase',
  epic_draw: 'Epic Draw Purchase',
  legendary_draw: 'Legendary Draw Purchase',
  ranked_draw_entry: 'Ranked Draw Entry Purchase',
  reward_merits: 'Merits Purchase',
  reward_energy: 'Energy Purchase',
};

// Type guards
function isPurchaseEntry(
  entry: ParsedHistoryEntry | ParsedPurchaseEntry
): entry is ParsedPurchaseEntry {
  return entry.type === 'purchase';
}

function isHistoryEntry(
  entry: ParsedHistoryEntry | ParsedPurchaseEntry
): entry is ParsedHistoryEntry {
  return 'blockNum' in entry;
}

// Helper function to get entry type metadata
function getEntryTypeInfo(entry: ParsedHistoryEntry | ParsedPurchaseEntry) {
  if (isPurchaseEntry(entry)) {
    return { label: 'Purchase', color: 'success' as const };
  }
  if (entry.type === 'claim_daily') {
    return { label: 'Daily Quest', color: 'primary' as const };
  }
  if (entry.type === 'claim_reward') {
    return { label: 'League Reward', color: 'secondary' as const };
  }
  return { label: 'Unknown', color: 'primary' as const };
}

// Component for daily quest details
function DailyQuestDetails({ entry }: { entry: ParsedHistoryEntry }) {
  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Quest: <strong>{entry.questName}</strong>
    </Typography>
  );
}

// Component for league advancement details
function LeagueAdvancementDetails({ entry }: { entry: ParsedHistoryEntry }) {
  const { format = '', tier = 0 } = entry.metaData || {};
  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      League Advancement: {capitalize(format)} - {leagueNames[tier]}
    </Typography>
  );
}

// Component for league season details
function LeagueSeasonDetails({ entry }: { entry: ParsedHistoryEntry }) {
  const { season } = entry.metaData || {};

  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Season: {season}
    </Typography>
  );
}

// Component for purchase details
function PurchaseDetails({ entry }: { entry: ParsedPurchaseEntry }) {
  const purchaseLabel = entry.subType
    ? PURCHASE_TYPE_LABELS[entry.subType] || 'Unknown Purchase Type'
    : 'Unknown Purchase Type';

  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {entry.quantity}x {purchaseLabel} · {entry.paymentAmount?.toLocaleString()}{' '}
      {entry.paymentCurrency}
      {entry.amountUsd && ` ($${entry.amountUsd})`}
    </Typography>
  );
}

export const ListContentSummary = ({ entry }: Props) => {
  const { label, color } = getEntryTypeInfo(entry);
  const isHistory = isHistoryEntry(entry);
  const isPurchase = isPurchaseEntry(entry);

  // Determine which details component to render
  const renderDetails = () => {
    if (entry.type === 'claim_daily' && isHistory) {
      return <DailyQuestDetails entry={entry} />;
    }

    if (entry.type === 'claim_reward' && isHistory) {
      const metaDataType = entry.metaData?.type;

      if (metaDataType === 'league') {
        return <LeagueAdvancementDetails entry={entry} />;
      }

      if (metaDataType === 'league_season') {
        return <LeagueSeasonDetails entry={entry} />;
      }
    }

    if (isPurchase) {
      return <PurchaseDetails entry={entry} />;
    }

    return null;
  };

  return (
    <Box>
      {/* Header with type chip and date */}
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Chip label={label} color={color} size="small" />
        <Typography variant="caption" color="text.secondary">
          {new Date(entry.createdDate).toLocaleString()}
        </Typography>
      </Stack>

      {/* Type-specific details */}
      {renderDetails()}
    </Box>
  );
};
