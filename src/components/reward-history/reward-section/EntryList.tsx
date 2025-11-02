'use client';

import {
  dec_icon_url,
  energy_icon_url,
  glint_icon_url,
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  ranked_entries_icon_url,
  reward_draw_major_icon_url,
} from '@/lib/staticsIconUrls';
import { ParsedHistoryEntry, ParsedPurchaseEntry, ParsedReward } from '@/types/spl/parsedHistory';
import { Avatar, Box, Card, CardContent, Chip, Stack, Typography, alpha } from '@mui/material';
import { ListIcon } from './ListIcon';

interface EntryListItemProps {
  entry: ParsedHistoryEntry | ParsedPurchaseEntry;
  index: number;
}

function getRewardIconUrl(rewardType: string): string | null {
  const iconMap: Record<string, string> = {
    merits: merits_icon_url,
    energy: energy_icon_url,
    potion_gold: gold_icon_url,
    potion_legendary: legendary_icon_url,
    ranked_entries: ranked_entries_icon_url,
    glint: glint_icon_url,
    dec: dec_icon_url,
    reward_card: reward_draw_major_icon_url,
  };

  return iconMap[rewardType] || iconMap.reward_card;
}

function formatReward(reward: ParsedReward): string {
  console.log('Formatting reward:', reward);
  if (reward.card) {
    return `${reward.quantity}x Card #${reward.card.card_detail_id}${reward.card.gold ? ' (Gold)' : ''}`;
  }
  if (reward.potion_type) {
    return `${reward.quantity}x ${reward.potion_type} Potion`;
  }
  return `${reward.quantity}x ${reward.type}`;
}

function isPurchaseEntry(
  entry: ParsedHistoryEntry | ParsedPurchaseEntry
): entry is ParsedPurchaseEntry {
  return entry.type === 'purchase';
}

function isHistoryEntry(
  entry: ParsedHistoryEntry | ParsedPurchaseEntry
): entry is ParsedHistoryEntry {
  return entry.type === 'claim_daily' || entry.type === 'claim_reward';
}

export function EntryListItem({ entry }: EntryListItemProps) {
  const isPurchase = isPurchaseEntry(entry);
  const isHistory = isHistoryEntry(entry);

  // Get type label and color
  let typeLabel = '';
  let typeColor: 'primary' | 'secondary' | 'success' = 'primary';

  if (isPurchase) {
    typeLabel = 'Purchase';
    typeColor = 'success';
    //todo getIcon
  } else if (entry.type === 'claim_daily') {
    typeLabel = 'Daily Quest';
    typeColor = 'primary';
    //todo getIcon
  } else if (entry.type === 'claim_reward') {
    typeLabel = 'League Reward';
    typeColor = 'secondary';
    //todo getIcon
  }

  // Get rewards array
  let rewards: ParsedReward[] = [];
  if (entry.rewards) {
    rewards = Array.isArray(entry.rewards) ? entry.rewards : [entry.rewards];
  }

  // Get icon for first reward or default
  const firstReward = rewards[0];
  const iconUrl = firstReward
    ? firstReward.potion_type
      ? getRewardIconUrl(`potion_${firstReward.potion_type}`)
      : getRewardIconUrl(firstReward.type)
    : null;

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
          <ListIcon event={event} isPurchase={isPurchase} />
          {/* Icon */}
          {iconUrl && (
            <Avatar
              src={iconUrl}
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          )}

          {/* Content */}
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Chip label={typeLabel} color={typeColor} size="small" />
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.createdDate).toLocaleString()}
              </Typography>
            </Stack>

            {/* Type-specific details */}
            {isHistory && entry.type === 'claim_daily' && entry.questName && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quest: <strong>{entry.questName}</strong>
              </Typography>
            )}

            {isHistory &&
              entry.type === 'claim_reward' &&
              entry.metaData &&
              entry.metaData?.type === 'league' && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {entry.metaData.format} - Tier {entry.metaData.tier}
                </Typography>
              )}

            {isHistory &&
              entry.type === 'claim_reward' &&
              entry.metaData &&
              entry.metaData?.type === 'league_season' && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Season {entry.metaData.season} – {entry.metaData.rewards} Claimed Glint {''}
                  {entry.metaData.affiliate_rewards &&
                    entry.metaData.affiliate_rewards > 0 &&
                    `- ${entry.metaData.affiliate_rewards} Glint from affiliate rewards`}
                </Typography>
              )}

            {isPurchase && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>{entry.type.replace('_', ' ')}</strong>
                {entry.subType && ` - ${entry.subType.replace('_', ' ')}`}
                {' · '}
                {entry.paymentAmount?.toLocaleString()} {entry.paymentCurrency}
                {entry.amountUsd && ` ($${entry.amountUsd})`}
              </Typography>
            )}

            {/* Rewards */}
            {rewards.length > 0 && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Rewards ({rewards.length}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {rewards.slice(0, 5).map((reward, idx) => {
                    const rewardIconUrl = reward.potion_type
                      ? getRewardIconUrl(`potion_${reward.potion_type}`)
                      : getRewardIconUrl(reward.type);
                    return (
                      <Chip
                        key={idx}
                        avatar={rewardIconUrl ? <Avatar src={rewardIconUrl} /> : undefined}
                        label={formatReward(reward)}
                        size="small"
                        variant="outlined"
                      />
                    );
                  })}
                  {rewards.length > 5 && (
                    <Chip
                      label={`+${rewards.length - 5} more`}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
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
