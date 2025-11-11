'use server';
// Server action for fetching daily progress
import logger from '@/lib/log/logger.server';
import { decryptToken } from '@/lib/auth/encryption';
import { SplFormat } from '@/types/spl/format';
import { SplDailyProgress } from '@/types/spl/dailies';
import { fetchDailyProgress } from '@/lib/api/splApi';

export async function fetchPlayersDailyProgress(
  users: Array<{ username: string; encryptedToken: string | null }>
) {
  try {
    if (!users || !Array.isArray(users) || users.length === 0) {
      throw new Error('Users array is required');
    }

    logger.info(`Fetching daily progress for users: ${users.map(u => u.username).join(', ')}`);

    const playerData = [];

    for (const user of users) {
      try {
        const username = user.username;
        const token = await decryptToken(user.encryptedToken!, process.env.SECRET_ENCRYPTION_KEY!);

        if (!token) {
          logger.error('Failed to decrypt token in daily progress action');
          throw new Error('Invalid encryption token');
        }

        const formats: SplFormat[] = ['wild', 'modern', 'foundation'];
        const playerDailies: Partial<Record<SplFormat, SplDailyProgress>> = {};

        for (const format of formats) {
          const dailyProgress = await fetchDailyProgress(username, token, format);
          playerDailies[format] = dailyProgress;
        }

        playerData.push({
          username,
          dailyProgress: playerDailies,
        });
      } catch (userError) {
        logger.error(
          `Failed to fetch data for user ${user.username} - ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        playerData.push({
          username: user.username,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Successfully fetched daily progress data for all users ${users.length}`);

    return {
      players: playerData,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account dailies action error: ${errorMessage}`);
    throw new Error('Failed to fetch player data');
  }
}
