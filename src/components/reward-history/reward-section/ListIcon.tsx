import { findLeagueLogoUrl } from '@/lib/staticsIconUrls';
import { SplFormat } from '@/types/spl/format';
import { ParsedHistoryEntry, ParsedPurchaseEntry } from '@/types/spl/parsedHistory';
import { Avatar } from '@mui/material';

interface Props {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
}

function getPurchaseIcon(buyType: string): string {
  console.log(buyType);
  switch (buyType) {
    case 'merits':
      return 'Merits Icon';
    case 'coins':
      return 'Coins Icon';
    default:
      return 'Default Purchase Icon';
  }
}
function getDailyQuestIcon(questName: string): string {
  console.log(questName);
  // You can customize icons based on quest names if needed
  return 'Daily Quest Icon';
}

export const ListIcon = ({ entry }: Props) => {
  const getIcon = (entry: ParsedHistoryEntry | ParsedPurchaseEntry) => {
    switch (entry.type) {
      case 'purchase':
        const purchaseEntry = entry as ParsedPurchaseEntry;
        return getPurchaseIcon(purchaseEntry.buyType);
      case 'claim_daily':
        const dailyEntry = entry as ParsedHistoryEntry;
        return getDailyQuestIcon(dailyEntry.questName ?? 'unknown');
      case 'claim_reward':
        const claimRewardEntry = entry as ParsedHistoryEntry;
        return findLeagueLogoUrl(
          (claimRewardEntry.metaData?.format as SplFormat) || 'wild',
          claimRewardEntry.metaData?.tier || 0
        );
      default:
        return null;
    }
  };

  return (
    <Avatar
      src={getIcon(entry)}
      sx={{
        width: 48,
        height: 48,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
  );
};
