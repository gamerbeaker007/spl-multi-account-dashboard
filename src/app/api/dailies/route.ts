import { fetchDailyProgress } from '@/lib/api/splApi';
import { decryptToken } from '@/lib/auth/encryption';
import logger from '@/lib/log/logger.server';
import { SplDailyProgress } from '@/types/spl/dailies';
import { SplFormat } from '@/types/spl/format';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // array with users as input
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }

    const playerData = [];

    for (const user of users) {
      try {
        const username = user.username;
        const token = await decryptToken(user.encryptedToken, process.env.SECRET_ENCRYPTION_KEY!);

        if (!token) {
          logger.error('Failed to decrypt token in daily progress API route');
          return NextResponse.json({ error: 'Invalid encryption token' }, { status: 400 });
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
          `Failed to fetch data for user ${user}: ${userError instanceof Error ? userError.message : 'Unknown error'}`
        );
        // Continue processing other users even if one fails
        playerData.push({
          username: user,
          error: userError instanceof Error ? userError.message : 'Failed to fetch user data',
        });
      }
    }

    logger.info(`Multi-account dailies API route completed: ${playerData.length} users processed`);
    return NextResponse.json({
      players: playerData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Multi-account dailies API error: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
