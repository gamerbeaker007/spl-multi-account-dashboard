'use client';

import { ParsedHistory, ParsedPlayerRewardHistory } from '@/types/parsedHistory';
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

    const combined: ParsedHistory[] = [];

    if (entryFilter === 'all') {
      combined.push(...rewardHistory.allEntries);
    } else if (entryFilter === 'daily') {
      combined.push(...rewardHistory.allEntries.filter(entry => entry.type === 'claim_daily'));
    } else if (entryFilter === 'league') {
      combined.push(...rewardHistory.allEntries.filter(entry => entry.type === 'claim_reward'));
    } else if (entryFilter === 'purchase') {
      combined.push(...rewardHistory.allEntries.filter(entry => entry.type === 'purchase'));
    }

    return combined.sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    );
  }, [rewardHistory, entryFilter]);

  const dailyEntries = rewardHistory
    ? rewardHistory.allEntries.filter(entry => entry.type === 'claim_daily').length
    : 0;
  const leagueEntries = rewardHistory
    ? rewardHistory.allEntries.filter(entry => entry.type === 'claim_reward').length
    : 0;
  const purchaseEntries = rewardHistory
    ? rewardHistory.allEntries.filter(entry => entry.type === 'purchase').length
    : 0;

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
                All ({dailyEntries + leagueEntries + purchaseEntries})
              </Button>
              <Button
                variant={entryFilter === 'daily' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('daily')}
              >
                Daily ({dailyEntries})
              </Button>
              <Button
                variant={entryFilter === 'league' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('league')}
              >
                League ({leagueEntries})
              </Button>
              <Button
                variant={entryFilter === 'purchase' ? 'contained' : 'outlined'}
                onClick={() => setEntryFilter('purchase')}
              >
                Purchase ({purchaseEntries})
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
