// Simple reward aggregation function for the API response format
import {
  ParsedHistoryEntry,
  ParsedPurchaseEntry,
  ParsedReward,
  RewardSummary,
} from '@/types/spl/parsedHistory';
import logger from './log/logger.server';

export function aggregateRewards(entries: ParsedHistoryEntry[]): RewardSummary {
  const summary: RewardSummary = {
    totalPacks: {},
    totalFrontierEntries: 0,
    totalRankedEntries: 0,
    totalCards: {},
    totalPotions: {},
    totalPotionsUsed: {},
    totalMerits: 0,
    totalEnergy: 0,
    totalScrolls: {},
    totalDraws: { minor: 0, major: 0, ultimate: 0 },
    totalShopDraws: { minor: 0, major: 0, ultimate: 0 },
    totalRarityDraws: { common: 0, rare: 0, epic: 0, legendary: 0 },
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

        // Process potions used
        // Process potions used for each draw tier
        ['minor', 'major', 'ultimate'].forEach((tier: string) => {
          const tierResult = rewards[tier as 'minor' | 'major' | 'ultimate']?.result;
          if (tierResult?.potions) {
            Object.entries(tierResult.potions).forEach(([potionType, potionData]) => {
              summary.totalPotionsUsed[potionType] =
                (summary.totalPotionsUsed[potionType] || 0) + (potionData.charges_used || 0);
            });
          }
        });

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
      case 'reward_merits':
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
      default:
        logger.warn(`Unknown reward type encountered during aggregation: ${reward.type}`);
        break;
    }
  });
}

/**
 * Aggregate rewards from purchase entries
 */
export function aggregatePurchaseRewards(entries: ParsedPurchaseEntry[]): RewardSummary {
  const summary: RewardSummary = {
    totalPacks: {},
    totalFrontierEntries: 0,
    totalRankedEntries: 0,
    totalCards: {},
    totalPotions: {},
    totalPotionsUsed: {},
    totalMerits: 0,
    totalEnergy: 0,
    totalScrolls: {},
    totalDraws: { minor: 0, major: 0, ultimate: 0 },
    totalShopDraws: { minor: 0, major: 0, ultimate: 0 },
    totalRarityDraws: { common: 0, rare: 0, epic: 0, legendary: 0 },
    leagueAdvancements: { foundation: [], wild: [], modern: [] },
    questTypeBreakdown: {},
  };

  entries.forEach(entry => {
    // Process rewards from draw purchases
    if (entry.rewards && Array.isArray(entry.rewards)) {
      processRewardArray(entry.rewards, summary);
    }

    // Track draw purchases by sub-type
    switch (entry.subType) {
      case 'minor_draw':
        summary.totalShopDraws.minor += entry.quantity || 0;
        break;
      case 'major_draw':
        summary.totalShopDraws.major += entry.quantity || 0;
        break;
      case 'ultimate_draw':
        summary.totalShopDraws.ultimate += entry.quantity || 0;
        break;
      case 'common_draw':
        summary.totalRarityDraws.common += entry.quantity || 0;
        break;
      case 'rare_draw':
        summary.totalRarityDraws.rare += entry.quantity || 0;
        break;
      case 'epic_draw':
        summary.totalRarityDraws.epic += entry.quantity || 0;
        break;
      case 'legendary_draw':
        summary.totalRarityDraws.legendary += entry.quantity || 0;
        break;
      default:
        break;
    }
  });
  return summary;
}

/**
 * Merge multiple reward summaries into one
 */
export function mergeRewardSummaries(...summaries: RewardSummary[]): RewardSummary {
  const merged: RewardSummary = {
    totalPacks: {},
    totalFrontierEntries: 0,
    totalRankedEntries: 0,
    totalCards: {},
    totalPotions: {},
    totalPotionsUsed: {},
    totalMerits: 0,
    totalEnergy: 0,
    totalScrolls: {},
    totalDraws: { minor: 0, major: 0, ultimate: 0 },
    totalShopDraws: { minor: 0, major: 0, ultimate: 0 },
    totalRarityDraws: { common: 0, rare: 0, epic: 0, legendary: 0 },
    leagueAdvancements: { foundation: [], wild: [], modern: [] },
    questTypeBreakdown: {},
  };

  summaries.forEach(summary => {
    // Merge packs
    Object.entries(summary.totalPacks).forEach(([edition, count]) => {
      merged.totalPacks[Number(edition)] = (merged.totalPacks[Number(edition)] || 0) + count;
    });

    // Merge entries
    merged.totalFrontierEntries += summary.totalFrontierEntries;
    merged.totalRankedEntries += summary.totalRankedEntries;

    // Merge cards
    Object.entries(summary.totalCards).forEach(([cardId, data]) => {
      const id = Number(cardId);
      if (!merged.totalCards[id]) {
        merged.totalCards[id] = { ...data };
      } else {
        merged.totalCards[id].quantity += data.quantity;
        merged.totalCards[id].gold += data.gold;
        merged.totalCards[id].regular += data.regular;
      }
    });

    // Merge potions
    Object.entries(summary.totalPotions).forEach(([type, count]) => {
      merged.totalPotions[type] = (merged.totalPotions[type] || 0) + count;
    });

    // Merge potions used
    Object.entries(summary.totalPotionsUsed).forEach(([type, count]) => {
      merged.totalPotionsUsed[type] = (merged.totalPotionsUsed[type] || 0) + count;
    });

    // Merge simple counters
    merged.totalMerits += summary.totalMerits;
    merged.totalEnergy += summary.totalEnergy;

    // Merge scrolls
    Object.entries(summary.totalScrolls).forEach(([type, count]) => {
      merged.totalScrolls[type] = (merged.totalScrolls[type] || 0) + count;
    });

    // Merge draws
    merged.totalDraws.minor += summary.totalDraws.minor;
    merged.totalDraws.major += summary.totalDraws.major;
    merged.totalDraws.ultimate += summary.totalDraws.ultimate;

    // Merge Shop draws
    merged.totalShopDraws.minor += summary.totalShopDraws.minor;
    merged.totalShopDraws.major += summary.totalShopDraws.major;
    merged.totalShopDraws.ultimate += summary.totalShopDraws.ultimate;

    // Merge league advancements
    merged.leagueAdvancements.foundation.push(...summary.leagueAdvancements.foundation);
    merged.leagueAdvancements.wild.push(...summary.leagueAdvancements.wild);
    merged.leagueAdvancements.modern.push(...summary.leagueAdvancements.modern);

    // Merge quest type breakdown
    Object.entries(summary.questTypeBreakdown).forEach(([type, count]) => {
      merged.questTypeBreakdown[type] = (merged.questTypeBreakdown[type] || 0) + count;
    });

    // Merge rarity draws
    merged.totalRarityDraws.common += summary.totalRarityDraws.common;
    merged.totalRarityDraws.rare += summary.totalRarityDraws.rare;
    merged.totalRarityDraws.epic += summary.totalRarityDraws.epic;
    merged.totalRarityDraws.legendary += summary.totalRarityDraws.legendary;
  });

  return merged;
}
