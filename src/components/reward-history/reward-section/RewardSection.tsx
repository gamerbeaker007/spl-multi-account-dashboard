'use client';

import {
  ParsedHistoryEntry,
  ParsedPlayerRewardHistory,
  ParsedPurchaseEntry,
} from '@/types/spl/parsedHistory';
import { Box, Button, ButtonGroup, Tab, Tabs } from '@mui/material';
import { useMemo, useState } from 'react';
import { RewardHistorySummary } from '../RewardHistorySummary';
import { EntryList } from './EntryList';

interface Props {
  rewardHistory: ParsedPlayerRewardHistory;
}

export function RewardSection({ rewardHistory }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [entryFilter, setEntryFilter] = useState<'all' | 'daily' | 'league' | 'purchase'>('all');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Combine and sort all entries by date
  const allEntries = useMemo(() => {
    if (!rewardHistory) return [];

    const combined: (ParsedHistoryEntry | ParsedPurchaseEntry)[] = [];

    // Add daily entries
    if (entryFilter === 'all' || entryFilter === 'daily') {
      combined.push(...rewardHistory.dailyEntries);
    }

    // Add league entries
    if (entryFilter === 'all' || entryFilter === 'league') {
      combined.push(...rewardHistory.leagueEntries);
    }

    // Add purchase entries
    if (entryFilter === 'all' || entryFilter === 'purchase') {
      combined.push(...rewardHistory.purchaseEntries);
    }

    // Sort by date descending (newest first)
    return combined.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }, [rewardHistory, entryFilter]);

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Summary" />
        <Tab label="Entries" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && <RewardHistorySummary rewardHistory={rewardHistory} />}

      {activeTab === 1 && (
        <Box>
          {/* Filter Buttons */}
          <Box mb={2}>
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={entryFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('all')}
              >
                All ({rewardHistory.totalEntries})
              </Button>
              <Button
                variant={entryFilter === 'daily' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('daily')}
              >
                Daily ({rewardHistory.dailyEntries.length})
              </Button>
              <Button
                variant={entryFilter === 'league' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('league')}
              >
                League ({rewardHistory.leagueEntries.length})
              </Button>
              <Button
                variant={entryFilter === 'purchase' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('purchase')}
              >
                Purchase ({rewardHistory.purchaseEntries.length})
              </Button>
            </ButtonGroup>
          </Box>

          {/* Entry List */}
          <EntryList entries={allEntries} />
        </Box>
      )}
    </>
  );
}
