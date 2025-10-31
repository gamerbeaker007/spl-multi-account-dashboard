import { SplHistory } from '@/types/spl/history';
import { ParsedData, ParsedHistoryEntry, ParsedReward } from '@/types/spl/parsedHistory';

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
 * Parse claim reward result JSON
 */
function parseClaimRewardResult(resultString: string): { rewards: ParsedReward } | null {
  try {
    const parsed = JSON.parse(resultString);
    const rewards = parsed.rewards || [];
    return { rewards };
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
    id: entry.id,
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
      const parsed = parseClaimRewardResult(entry.result);
      const parsedData = JSON.parse(entry.data) as ParsedData;
      if (parsed && parsedData) {
        baseEntry.metaData = {
          season: parsedData.season,
          format: parsedData.format,
          tier: parsedData.tier,
        };
        baseEntry.rewards = parsed.rewards;
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
 * Parse entire history response to typed format
 * Use this in the API route before returning data to client
 */
export function parsePlayerHistory(entries: SplHistory[]): ParsedHistoryEntry[] {
  return entries.map(entry => parseHistoryEntry(entry));
}
