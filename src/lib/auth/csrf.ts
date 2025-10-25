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
  return origins.split(',').map(origin => origin.trim());
};

// Validate origin
export const isValidOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigins = getAllowedOrigins();

  // For same-origin requests, origin might be null
  if (!origin && !referer) {
    return true;
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

  return false;
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
      return {
        isValid: false,
        error: 'Origin not allowed',
      };
    }

    // Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('csrf-token')?.value;

    if (!cookieToken) {
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
      return {
        isValid: false,
        error: 'Missing CSRF token',
      };
    }

    // Verify the token
    const isValid = csrfInstance.verify(getCsrfSecret(), tokenToValidate);

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid CSRF token',
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return {
      isValid: false,
      error: 'CSRF validation failed',
    };
  }
}
