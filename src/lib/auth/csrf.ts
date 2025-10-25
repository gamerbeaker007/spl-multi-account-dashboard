import csrf from 'csrf';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const csrfInstance = new csrf();

const getCsrfSecret = (): string => {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET environment variable must be set');
  }
  return secret;
};

// Get allowed origins from environment
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    throw new Error('ALLOWED_ORIGINS environment variable must be set');
  }
  return origins
    .split(',')
    .map(origin => origin.trim())
    .map(origin => (origin.endsWith('/') ? origin.slice(0, -1) : origin)) // Remove trailing slashes
    .map(origin => {
      // Ensure we have full URLs for comparison
      if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
        // For production domains, assume https
        return origin.includes('localhost') ? `http://${origin}` : `https://${origin}`;
      }
      return origin;
    });
};

// Validate origin
export const isValidOrigin = (request: NextRequest): boolean => {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const allowedOrigins = getAllowedOrigins();

    // Log for debugging on Vercel
    console.log('CSRF Origin Check:', {
      origin,
      referer,
      host,
      allowedOrigins,
      method: request.method,
    });

    // For same-origin requests, origin might be null
    if (!origin && !referer) {
      // Allow if host matches any allowed origin
      if (host) {
        const hostWithHttps = `https://${host}`;
        const hostWithHttp = `http://${host}`;
        if (allowedOrigins.includes(hostWithHttps) || allowedOrigins.includes(hostWithHttp)) {
          return true;
        }
      }
      return false; // Don't allow if we can't verify
    }

    // For same-origin requests where we have referer but no origin
    if (!origin && referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        if (allowedOrigins.includes(refererOrigin)) {
          return true;
        }
      } catch (error) {
        console.error('Error parsing referer URL:', error);
      }
    }

    // Check origin header
    if (origin && allowedOrigins.includes(origin)) {
      return true;
    }

    // Check referer header as fallback
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (allowedOrigins.includes(refererOrigin)) {
          return true;
        }
      } catch (error) {
        console.error('Error parsing referer URL:', error);
        return false;
      }
    }

    console.warn('Origin validation failed:', {
      origin,
      referer,
      allowedOrigins,
    });
    return false;
  } catch (error) {
    console.error('Error in isValidOrigin:', error);
    return false;
  }
};

export interface CsrfValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateCsrfToken(
  request: NextRequest,
  requestBody?: { csrfToken?: string; [key: string]: unknown }
): Promise<CsrfValidationResult> {
  try {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return { isValid: true };
    }

    // First validate origin
    if (!isValidOrigin(request)) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      console.error('CSRF Origin validation failed:', {
        origin,
        referer,
        allowedOrigins: getAllowedOrigins(),
      });
      return {
        isValid: false,
        error: 'Origin not allowed',
      };
    }

    // Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('csrf-token')?.value;

    if (!cookieToken) {
      console.error('CSRF: No cookie token found');
      return {
        isValid: false,
        error: 'CSRF session not found',
      };
    }

    // Get token from header or body
    const headerToken = request.headers.get('X-CSRF-Token');
    const bodyToken = requestBody?.csrfToken as string;
    const tokenToValidate = headerToken || bodyToken;

    if (!tokenToValidate) {
      console.error('CSRF: No token to validate', {
        hasHeaderToken: !!headerToken,
        hasBodyToken: !!bodyToken,
      });
      return {
        isValid: false,
        error: 'Missing CSRF token',
      };
    }

    // Verify the token
    const secret = getCsrfSecret();
    const isValid = csrfInstance.verify(secret, tokenToValidate);

    if (!isValid) {
      console.error('CSRF: Token verification failed');
      return {
        isValid: false,
        error: 'Invalid CSRF token',
      };
    }

    console.log('CSRF validation successful');
    return { isValid: true };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'CSRF validation failed',
    };
  }
}
