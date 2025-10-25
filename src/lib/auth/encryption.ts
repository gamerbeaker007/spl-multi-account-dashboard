/**
 * Simple encryption/decryption for development
 * In production, implement proper AES encryption
 */

/**
 * Simple base64 encoding for development
 * In production, you should use proper encryption
 */
export async function encryptToken(token: string, secretKey: string): Promise<string> {
  try {
    // For development, we'll use simple base64 encoding with a prefix
    // In production, implement proper AES encryption
    const combined = `${secretKey}:${token}`;
    const encoded = Buffer.from(combined).toString('base64');
    return `dev_${encoded}`;
  } catch (error) {
    throw new Error(
      `Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Simple base64 decoding for development
 * In production, you should use proper decryption
 */
export async function decryptToken(encryptedToken: string, secretKey: string): Promise<string> {
  try {
    // Check if it's our development format
    if (!encryptedToken.startsWith('dev_')) {
      throw new Error('Invalid token format');
    }

    const encoded = encryptedToken.slice(4); // Remove 'dev_' prefix
    const combined = Buffer.from(encoded, 'base64').toString('utf8');
    const [storedSecret, token] = combined.split(':');

    if (storedSecret !== secretKey) {
      throw new Error('Invalid secret key');
    }

    return token;
  } catch (error) {
    throw new Error(
      `Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates if a string is a valid encrypted token format
 */
export function isValidEncryptedTokenFormat(token: string): boolean {
  return token.startsWith('dev_') && token.length > 4;
}

/**
 * Example usage:
 *
 * // Encrypt a token
 * const secretKey = process.env.SECRET_ENCRYPTION_KEY!;
 * const originalToken = "your-jwt-token-here";
 * const encrypted = await encryptToken(originalToken, secretKey);
 *
 * // Decrypt a token
 * const decrypted = await decryptToken(encrypted, secretKey);
 *
 * // Validate token format
 * const isValid = isValidEncryptedTokenFormat(encrypted);
 */
