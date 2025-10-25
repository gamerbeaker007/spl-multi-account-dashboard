import { NextRequest, NextResponse } from 'next/server';
import { validateSplJwt } from '@/lib/auth/jwt/splJwtValidation';

export async function GET(request: NextRequest) {
  try {
    const jwtToken = request.cookies.get('jwt_token')?.value;

    if (!jwtToken) {
      return NextResponse.json({ authenticated: false });
    }

    // Validate JWT token including expiration check
    const jwtValidation = await validateSplJwt(jwtToken);

    if (!jwtValidation.valid) {
      // Clear invalid/expired cookies
      const response = NextResponse.json({
        authenticated: false,
        reason: jwtValidation.expired ? 'Token expired' : 'Invalid token',
      });

      response.cookies.delete('jwt_token');

      return response;
    }

    return NextResponse.json({
      authenticated: true,
      username: jwtValidation.username,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}
