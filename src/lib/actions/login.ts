'use server';

import logger from '@/lib/log/logger.server';

// Server action for login authentication
export async function loginWithSignature(
  username: string,
  timestamp: number,
  signature: string
): Promise<{ success: boolean; username: string; message: string; token: string }> {
  try {
    const { splLogin } = await import('@/lib/api/splApi');
    const { encryptToken } = await import('@/lib/auth/encryption');

    // Validate required fields
    if (!username || !timestamp || !signature) {
      throw new Error('Missing required fields');
    }

    logger.info(`Login attempt for user: ${username}`);

    // Call SPL API to validate signature and get JWT
    const splResponse = await splLogin(username, timestamp, signature);

    // Check for encryption key
    if (!process.env.SECRET_ENCRYPTION_KEY) {
      logger.error('SECRET_ENCRYPTION_KEY not configured');
      throw new Error('Server configuration error');
    }

    // Encrypt the token
    const encryptedToken = await encryptToken(
      splResponse.jwt_token,
      process.env.SECRET_ENCRYPTION_KEY
    );

    logger.info(`Login successful for user: ${username}`);

    return {
      success: true,
      username,
      message: 'Login successful',
      token: encryptedToken,
    };
  } catch (error) {
    logger.error(`Login action error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('Internal server error during login');
  }
}
