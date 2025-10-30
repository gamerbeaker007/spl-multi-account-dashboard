'use client';

import { ParsedPlayerRewardHistory } from '@/types/spl/parsedHistory';
import {
  FlashOn as EnergyIcon,
  Stars as MeritsIcon,
  CardGiftcard as PackIcon,
  LocalFireDepartment as PotionIcon,
  EmojiEvents as RewardIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface PlayerHistoryButtonProps {
  rewardHistory: ParsedPlayerRewardHistory; // Now expects parsed data
}

// Icon mapping for different reward types
const iconMap = {
  pack: PackIcon,
  entries: RewardIcon,
  potion: PotionIcon,
  merits: MeritsIcon,
  energy: EnergyIcon,
  card: RewardIcon,
  default: RewardIcon,
};

// Color mapping for different reward types
const colorMap = {
  pack: 'primary' as const,
  entries: 'secondary' as const,
  potion: 'warning' as const,
  merits: 'info' as const,
  energy: 'success' as const,
  card: 'primary' as const,
  default: 'inherit' as const,
};

export function RewardHistorySummary({ rewardHistory }: PlayerHistoryButtonProps) {

  return null;
}
