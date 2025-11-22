'use server';

import { decryptToken } from '@/lib/auth/encryption';
import { SplJwtValidationResult, validateSplJwt } from '@/lib/auth/jwt/splJwtValidation';
import logger from '@/lib/log/logger.server';

export async function validateEncryptedToken(
  encryptedToken: string
): Promise<SplJwtValidationResult> {
  try {
    if (!encryptedToken) {
      return { valid: false, error: 'No token provided' };
    }

    // Check for encryption key
    if (!process.env.SECRET_ENCRYPTION_KEY) {
      logger.error('SECRET_ENCRYPTION_KEY not configured');
      return { valid: false, error: 'Server configuration error' };
    }

    // Decrypt the token
    const decryptedToken = await decryptToken(encryptedToken, process.env.SECRET_ENCRYPTION_KEY);

    if (!decryptedToken) {
      return { valid: false, error: 'Failed to decrypt token' };
    }

    // Validate the JWT
    const validationResult = await validateSplJwt(decryptedToken);

    if (!validationResult.valid) {
      logger.info(`Token validation failed: ${validationResult.error}`);
    }

    return validationResult;
  } catch (error) {
    logger.error(
      `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token validation failed',
    };
  }
}
