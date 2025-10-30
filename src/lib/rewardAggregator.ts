// Simple reward aggregation function for the API response format
import { ParsedHistoryEntry, ParsedReward } from '@/types/spl/parsedHistory';

interface RewardSummary {
  totalPacks: { [edition: number]: number };
  totalFrontierEntries: number;
  totalRankedEntries: number;
  totalCards: {
    [cardId: number]: { edition: number; quantity: number; gold: number; regular: number };
  };
  totalPotions: { [potionType: string]: number };
  totalMerits: number;
  totalEnergy: number;
  totalScrolls: { [scrollType: string]: number };
  totalDraws: { minor: number; major: number; ultimate: number };
  leagueAdvancements: { foundation: number[]; wild: number[]; modern: number[] };
  questTypeBreakdown: { [questType: string]: number };
}

export function aggregateRewards(entries: ParsedHistoryEntry[]): RewardSummary {
  const summary: RewardSummary = {
    totalPacks: {},
    totalFrontierEntries: 0,
    totalRankedEntries: 0,
    totalCards: {},
    totalPotions: {},
    totalMerits: 0,
    totalEnergy: 0,
    totalScrolls: {},
    totalDraws: { minor: 0, major: 0, ultimate: 0 },
    leagueAdvancements: { foundation: [], wild: [], modern: [] },
    questTypeBreakdown: {},
  };

  entries.forEach(entry => {
    // Count quest types for daily claims
    if (entry.type === 'claim_daily' && entry.questName) {
      summary.questTypeBreakdown[entry.questName] =
        (summary.questTypeBreakdown[entry.questName] || 0) + 1;
    }

    // Process rewards - handle both array format and complex claim_reward format
    if (entry.rewards) {
      if (Array.isArray(entry.rewards)) {
        // Simple reward array (from claim_daily)
        processRewardArray(entry.rewards, summary);
      } else if (typeof entry.rewards === 'object') {
        // Complex claim_reward format with minor/major/ultimate
        const rewards = entry.rewards;

        // Count draws
        if (rewards.minor_draw) summary.totalDraws.minor += rewards.minor_draw;
        if (rewards.major_draw) summary.totalDraws.major += rewards.major_draw;
        if (rewards.ultimate_draw) summary.totalDraws.ultimate += rewards.ultimate_draw;

        // Process each tier's rewards
        if (rewards.minor?.result?.rewards) {
          processRewardArray(rewards.minor.result.rewards, summary);
        }
        if (rewards.major?.result?.rewards) {
          processRewardArray(rewards.major.result.rewards, summary);
        }
        if (rewards.ultimate?.result?.rewards) {
          processRewardArray(rewards.ultimate.result.rewards, summary);
        }

        //process meta data
        entry.metaData = entry.metaData || {};
        switch (entry.metaData.format) {
          case 'foundation':
            if (entry.metaData.tier) {
              summary.leagueAdvancements.foundation.push(entry.metaData.tier);
            }
            break;
          case 'wild':
            if (entry.metaData.tier) {
              summary.leagueAdvancements.wild.push(entry.metaData.tier);
            }
            break;
          case 'modern':
            if (entry.metaData.tier) {
              summary.leagueAdvancements.modern.push(entry.metaData.tier);
            }
            break;
        }
      }
    }
  });

  return summary;
}

function processRewardArray(rewards: ParsedReward[], summary: RewardSummary): void {
  rewards.forEach(reward => {
    switch (reward.type) {
      case 'pack':
        const edition = reward.edition || 0;
        summary.totalPacks[edition] = (summary.totalPacks[edition] || 0) + reward.quantity;
        break;

      case 'frontier_entries':
        summary.totalFrontierEntries += reward.quantity;
        break;

      case 'ranked_entries':
        summary.totalRankedEntries += reward.quantity;
        break;

      case 'reward_card':
        if (reward.card) {
          const cardId = reward.card.card_detail_id;
          if (!summary.totalCards[cardId]) {
            summary.totalCards[cardId] = {
              edition: reward.card.edition || 0,
              quantity: 0,
              gold: 0,
              regular: 0,
            };
          }
          summary.totalCards[cardId].quantity += reward.quantity;
          if (reward.card.gold) {
            summary.totalCards[cardId].gold += reward.quantity;
          } else {
            summary.totalCards[cardId].regular += reward.quantity;
          }
        }
        break;

      case 'potion':
        const potionType = reward.potion_type || 'unknown';
        summary.totalPotions[potionType] =
          (summary.totalPotions[potionType] || 0) + reward.quantity;
        break;

      case 'merits':
        summary.totalMerits += reward.quantity;
        break;

      case 'energy':
        summary.totalEnergy += reward.quantity;
        break;

      case 'common_scroll':
      case 'rare_scroll':
      case 'epic_scroll':
      case 'legendary_scroll':
        summary.totalScrolls[reward.type] =
          (summary.totalScrolls[reward.type] || 0) + reward.quantity;
        break;
    }
  });
}

export function formatRewardSummary(summary: RewardSummary): string {
  let output = '=== REWARD SUMMARY ===\n\n';

  // Quest breakdown
  output += 'Quest Type Breakdown:\n';
  Object.entries(summary.questTypeBreakdown).forEach(([questType, count]) => {
    output += `  ${questType}: ${count} claims\n`;
  });

  // Packs
  if (Object.keys(summary.totalPacks).length > 0) {
    output += 'Packs:\n';
    Object.entries(summary.totalPacks).forEach(([edition, count]) => {
      output += `  Edition ${edition}: ${count} packs\n`;
    });
    output += '\n';
  }

  // Entries
  if (summary.totalFrontierEntries > 0 || summary.totalRankedEntries > 0) {
    output += 'Entries:\n';
    if (summary.totalFrontierEntries > 0) {
      output += `  Frontier Entries: ${summary.totalFrontierEntries}\n`;
    }
    if (summary.totalRankedEntries > 0) {
      output += `  Ranked Entries: ${summary.totalRankedEntries}\n`;
    }
    output += '\n';
  }

  // Cards (top 10)
  if (Object.keys(summary.totalCards).length > 0) {
    output += 'Top Cards:\n';
    const sortedCards = Object.entries(summary.totalCards)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 10);

    sortedCards.forEach(([cardId, data]) => {
      output += `  Card ${cardId}: ${data.quantity} total (${data.gold} gold, ${data.regular} regular)\n`;
    });
    output += '\n';
  }

  // Potions
  if (Object.keys(summary.totalPotions).length > 0) {
    output += 'Potions:\n';
    Object.entries(summary.totalPotions).forEach(([type, count]) => {
      output += `  ${type}: ${count}\n`;
    });
    output += '\n';
  }

  // Other resources
  if (summary.totalMerits > 0) {
    output += `Merits: ${summary.totalMerits}\n`;
  }
  if (summary.totalEnergy > 0) {
    output += `Energy: ${summary.totalEnergy}\n`;
  }

  // Scrolls
  if (Object.keys(summary.totalScrolls).length > 0) {
    output += 'Scrolls:\n';
    Object.entries(summary.totalScrolls).forEach(([type, count]) => {
      output += `  ${type.replace('_', ' ')}: ${count}\n`;
    });
    output += '\n';
  }

  // Draw totals
  const totalDraws =
    summary.totalDraws.minor + summary.totalDraws.major + summary.totalDraws.ultimate;
  if (totalDraws > 0) {
    output += 'Draw Totals:\n';
    output += `  Minor Draws: ${summary.totalDraws.minor}\n`;
    output += `  Major Draws: ${summary.totalDraws.major}\n`;
    output += `  Ultimate Draws: ${summary.totalDraws.ultimate}\n`;
  }

  return output;
}
