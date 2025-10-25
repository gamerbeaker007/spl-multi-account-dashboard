import jwt from 'jsonwebtoken';

export interface SplJwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
  nbf?: number;
}

export interface SplJwtValidationResult {
  valid: boolean;
  username?: string;
  expired?: boolean;
  error?: string;
}

export async function validateSplJwt(
  token: string
): Promise<SplJwtValidationResult> {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // Decode the JWT without verification first to check structure
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || typeof decoded === 'string') {
      return { valid: false, error: 'Invalid JWT format' };
    }

    const payload = decoded.payload as SplJwtPayload;

    // Check if token has required SPL fields
    if (!payload || !payload.sub) {
      return { valid: false, error: 'Missing required SPL fields' };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    if (payload.exp && payload.exp < now) {
      return {
        valid: false,
        expired: true,
        username: payload.sub,
        error: 'JWT token has expired',
      };
    }

    // Check if token is not yet valid (nbf - not before)
    if (payload.nbf && payload.nbf > now) {
      return {
        valid: false,
        error: 'JWT token is not yet valid',
      };
    }

    return {
      valid: true,
      username: payload.sub,
      expired: false,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'JWT validation failed',
    };
  }
}
