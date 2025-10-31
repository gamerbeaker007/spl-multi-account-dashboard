'use client';

import { useCardDetails } from '@/hooks/useCardDetails';
import { ParsedPlayerRewardHistory } from '@/types/spl/parsedHistory';
import { Alert, Box, CircularProgress } from '@mui/material';
import { Cards } from './Cards';
import { Chests } from './Chests';
import { Consumables } from './Consumables';
import { Entries } from './Entries';
import { LeagueAdvancements } from './LeagueAdvancements';
import { Packs } from './Packs';

interface PlayerHistoryButtonProps {
  rewardHistory: ParsedPlayerRewardHistory; // Now expects parsed data
}

export function RewardHistorySummary({ rewardHistory }: PlayerHistoryButtonProps) {
  const { cardDetails, loading, error } = useCardDetails({ autoFetch: true });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box display={'flex'} flexDirection="column" gap={2}>
      <Box display={'flex'} flexDirection="row" gap={2}>
        <LeagueAdvancements leagueAdvancements={rewardHistory.aggregation.leagueAdvancements} />
        <Consumables
          totalPotions={rewardHistory.aggregation.totalPotions}
          totalMerits={rewardHistory.aggregation.totalMerits}
          totalEnergy={rewardHistory.aggregation.totalEnergy}
          totalScrolls={rewardHistory.aggregation.totalScrolls}
        />
        <Packs packs={rewardHistory.aggregation.totalPacks} />
        <Entries
          totalFrontierEntries={rewardHistory.aggregation.totalFrontierEntries}
          totalRankedEntries={rewardHistory.aggregation.totalRankedEntries}
        />
      </Box>

      <Chests totalDraws={rewardHistory.aggregation.totalDraws} />
      <Cards totalCards={rewardHistory.aggregation.totalCards} cardDetails={cardDetails} />
    </Box>
  );
}
