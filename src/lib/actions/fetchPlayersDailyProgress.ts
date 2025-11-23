'use server';
// Server action for fetching daily progress
import logger from '@/lib/log/logger.server';
import { decryptToken } from '@/lib/auth/encryption';
import { fetchDailyProgress } from '@/lib/api/splApi';
import { DailyProgressData } from '@/types/playerDailyProgress';
import { cacheLife } from 'next/cache';

export async function fetchPlayersDailyProgress(
  user: string,
  encryptedToken: string
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
      const token = await decryptToken(encryptedToken!, process.env.SECRET_ENCRYPTION_KEY!);

      if (!token) {
        logger.error('Failed to decrypt token in daily progress action');
        throw new Error('Invalid encryption token');
      }

      // Fetch all formats in parallel for better performance
      const [wildProgress, modernProgress, foundationProgress] = await Promise.all([
        fetchDailyProgress(user, token, 'wild'),
        fetchDailyProgress(user, token, 'modern'),
        fetchDailyProgress(user, token, 'foundation'),
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
