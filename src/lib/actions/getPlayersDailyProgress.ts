'use server';
// Server action for fetching daily progress
import { fetchDailyProgress } from '@/lib/api/splApi';
import { getUserTokenCookie } from '@/lib/auth/cookies';
import logger from '@/lib/log/logger.server';
import { DailyProgressData } from '@/types/playerDailyProgress';
import { cacheLife } from 'next/cache';

export async function getPlayersDailyProgress(
  user: string
): Promise<DailyProgressData> {
  // Fetch token from cookies BEFORE cache scope
  const encryptedToken = await getUserTokenCookie(user);

  return await getPlayersDailyProgressCached(user, encryptedToken);
}

async function getPlayersDailyProgressCached(
  user: string,
  encryptedToken: string | null
): Promise<DailyProgressData> {
  'use cache';
  cacheLife('minutes');

  try {
    logger.info(`Fetching daily progress for users: ${user}`);
    const playerDailies = {
      username: user,
      timestamp: new Date().toISOString(),
    };

    try {
      // Fetch all formats in parallel for better performance
      const [wildProgress, modernProgress, foundationProgress] = await Promise.all([
        fetchDailyProgress(user, 'wild', encryptedToken),
        fetchDailyProgress(user, 'modern', encryptedToken),
        fetchDailyProgress(user, 'foundation', encryptedToken),
      ]);

      logger.info(`Successfully fetched daily progress data for user: ${user}`);

      return {
        ...playerDailies,
        format: {
          modern: modernProgress,
          wild: wildProgress,
          foundation: foundationProgress,
        },
      };
    } catch (userError) {
      logger.error(
        `Failed to fetch data for user ${user} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
      );

      return {
        ...playerDailies,
        error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account dailies action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
