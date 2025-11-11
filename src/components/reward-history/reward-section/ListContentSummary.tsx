import { leagueNames } from '@/lib/utils';
import {
  ClaimDailyResult,
  ClaimLeagueRewardData,
  ClaimSeasonLeagueRewardData,
  ParsedHistory,
  PurchaseResult,
} from '@/types/parsedHistory';
import { Box, capitalize, Chip, Stack, Typography } from '@mui/material';

interface Props {
  entry: ParsedHistory;
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
  unbind_scroll: 'Unbind Scroll Purchase',
  potion: 'Potion Purchase',
};

// Helper function to get entry type metadata
function getEntryTypeInfo(entry: ParsedHistory) {
  if (entry.type === 'purchase') {
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
function DailyQuestDetails({ entry }: { entry: ParsedHistory }) {
  const result = entry.result as ClaimDailyResult;
  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Quest: <strong>{result.quest_data.name}</strong>
    </Typography>
  );
}

// Component for league advancement details
function LeagueAdvancementDetails({ entry }: { entry: ClaimLeagueRewardData }) {
  const { format = '', tier = 0 } = entry || {};
  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      League Advancement: {capitalize(format)} - {leagueNames[tier]}
    </Typography>
  );
}

// Component for league season details
function LeagueSeasonDetails({ entry }: { entry: ClaimSeasonLeagueRewardData }) {
  const { season } = entry || {};

  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Season: {season}
    </Typography>
  );
}

// Component for purchase details
function PurchaseDetails({ entry }: { entry: PurchaseResult }) {
  const findType = entry.sub_type || entry.type;
  const purchaseLabel = findType
    ? PURCHASE_TYPE_LABELS[findType] || 'Unknown Purchase Type'
    : 'Unknown Purchase Type';

  let qty = entry.quantity || 0;
  if (findType === 'reward_merits') {
    qty = qty / 200; // Convert merits to number of purchases (2000 merits per purchase)
  }

  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {qty}x {purchaseLabel} · {entry.payment_amount?.toLocaleString()} {entry.payment_currency}
    </Typography>
  );
}

export const ListContentSummary = ({ entry }: Props) => {
  const { label, color } = getEntryTypeInfo(entry);
  const isHistory = entry.type !== 'purchase';
  const isPurchase = entry.type === 'purchase';

  // Determine which details component to render
  const renderDetails = () => {
    if (entry.type === 'claim_daily' && isHistory) {
      return <DailyQuestDetails entry={entry} />;
    }

    if (entry.type === 'claim_reward' && isHistory) {
      const result = entry.data as ClaimLeagueRewardData | ClaimSeasonLeagueRewardData;
      const metaDataType = result.type;

      if (metaDataType === 'league') {
        return <LeagueAdvancementDetails entry={result} />;
      }

      if (metaDataType === 'league_season') {
        return <LeagueSeasonDetails entry={result} />;
      }
    }

    if (isPurchase) {
      return <PurchaseDetails entry={entry.result as PurchaseResult} />;
    }

    return null;
  };

  return (
    <Box>
      {/* Header with type chip and date */}
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Chip label={label} color={color} size="small" />
        <Typography variant="caption" color="text.secondary">
          {new Date(entry.created_date).toLocaleString()}
        </Typography>
      </Stack>

      {/* Type-specific details */}
      {renderDetails()}
    </Box>
  );
};
