import { SplHistory } from '@/types/spl/history';
import {
  ParsedData,
  ParsedHistoryEntry,
  ParsedPurchaseEntry,
  ParsedReward,
} from '@/types/spl/parsedHistory';

/**
 * Parse daily quest result JSON
 */
function parseDailyQuestResult(
  resultString: string
): { questName: string; rewards: ParsedReward[] } | null {
  try {
    const parsed = JSON.parse(resultString);
    if (parsed.quest_data && parsed.quest_data.rewards) {
      const rewardsData =
        typeof parsed.quest_data.rewards === 'string'
          ? JSON.parse(parsed.quest_data.rewards)
          : parsed.quest_data.rewards;

      const rewards = rewardsData?.result?.rewards || [];
      return {
        questName: parsed.quest_data.name || 'Unknown',
        rewards,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse single history entry to typed format
 * This function should be used in the API route to parse data before sending to client
 */
export function parseHistoryEntry(entry: SplHistory): ParsedHistoryEntry {
  const baseEntry: ParsedHistoryEntry = {
    type: entry.type,
    blockNum: entry.block_num,
    createdDate: entry.created_date,
    rewards: [],
    success: entry.success,
  };

  if (!entry.result || !entry.success) {
    return baseEntry;
  }

  try {
    if (entry.type === 'claim_daily') {
      const parsed = parseDailyQuestResult(entry.result);
      if (parsed) {
        baseEntry.questName = parsed.questName;
        baseEntry.rewards = parsed.rewards;
      } else {
        console.error('Failed to parse daily quest result:', entry.result);
        baseEntry.hasParsingError = true;
        baseEntry.rawData = entry.result;
      }
    } else if (entry.type === 'claim_reward') {
      const parsedData = JSON.parse(entry.data) as ParsedData;
      const parsedResult = JSON.parse(entry.result);
      if (parsedData && parsedResult) {
        if (parsedData.type === 'league') {
          baseEntry.rewards = (parsedResult.rewards as ParsedReward[]) || [];
        } else if (parsedData.type === 'league_season') {
          baseEntry.rewards = (parsedResult as ParsedReward[]) || [];
        }

        baseEntry.metaData = {
          type: parsedData.type,
          season: parsedData.season,
          format: parsedData.format,
          tier: parsedData.tier,
          rewards: parsedResult.rewards, // Total glint for league_season
          affiliate_rewards: parsedResult.affiliate_rewards, // Affiliate rewards for league_season
        };
      } else {
        console.error('Failed to parse claim reward result:', entry.result);
        baseEntry.hasParsingError = true;
        baseEntry.rawData = entry.result;
      }
    } else {
      console.error('Unknown history entry type:', entry.type);
      // Unknown type, store as raw data
      baseEntry.hasParsingError = true;
      baseEntry.rawData = entry.result;
    }
  } catch {
    baseEntry.hasParsingError = true;
    baseEntry.rawData = entry.result;
  }

  return baseEntry;
}

/**
 * Parse purchase entry from SplHistory format (when type is 'purchase')
 */
export function parsePurchaseEntry(historyEntry: SplHistory): ParsedPurchaseEntry | undefined {
  // Parse the data field which contains the purchase details
  let purchaseData: {
    type?: string;
    qty?: number;
    currency?: string;
    data?: string; // JSON string with additional purchase data
    result?: string; // JSON string with the result of the purchase
  } = {};

  try {
    if (historyEntry.data) {
      purchaseData = JSON.parse(historyEntry.data);
    }
  } catch (error) {
    console.error('Failed to parse purchase data:', error);
  }

  //Only process glint shop purchases
  if (!['reward_draw', 'ranked_draw_entry', 'ranked_draw'].includes(purchaseData.type as string))
    return undefined;

  const baseEntry: ParsedPurchaseEntry = {
    type: historyEntry.type,
    buyType: purchaseData.type || 'unknown',
    createdDate: historyEntry.created_date,
    success: historyEntry.success,
  };

  if (historyEntry.result) {
    try {
      const baseResult = JSON.parse(historyEntry.result);
      baseEntry.subType = baseResult.sub_type;
      baseEntry.paymentAmount = parseFloat(baseResult.payment_amount);
      baseEntry.paymentCurrency = baseResult.payment_currency;
      baseEntry.quantity = baseResult.quantity;
      baseEntry.bonusQuantity = baseResult.bonus_quantity;
      if (purchaseData.type === 'reward_draw') {
        const data = JSON.parse(baseResult.data);
        baseEntry.potions = data.result.potions;
        baseEntry.rewards = data.result.rewards as ParsedReward[];
      } else if (purchaseData.type === 'ranked_draw_entry') {
        const data = JSON.parse(baseResult.data);
        baseEntry.rewards = data.result.rewards as ParsedReward[];
      } else {
        console.warn('Unhandled purchase type in result parsing:', purchaseData.type);
        baseEntry.hasParsingError = true;
        baseEntry.rawData = historyEntry.result;
      }
    } catch {
      baseEntry.hasParsingError = true;
      baseEntry.rawData = historyEntry.result;
    }
  }

  return baseEntry;
}

/**
 * Parse entire history response to typed format
 * Use this in the API route before returning data to client
 */
export function parsePlayerHistory(entries: SplHistory[]): ParsedHistoryEntry[] {
  return entries.map(entry => parseHistoryEntry(entry));
}
