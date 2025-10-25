import { NextRequest, NextResponse } from 'next/server';
import csrf from 'csrf';
import { cookies } from 'next/headers';
import { isValidOrigin } from '@/lib/auth/csrf';

// Initialize CSRF with a secret from environment
const csrfInstance = new csrf();
const CSRF_SECRET =
  process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

export async function GET(request: NextRequest) {
  try {
    if (!isValidOrigin(request)) {
      console.error(
        '❌ Origin validation failed',
        'Invalid origin in CSRF request'
      );
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      );
    }

    // Generate a new CSRF token
    const token = csrfInstance.create(CSRF_SECRET);

    // Set the token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Also return the token in the response for client-side access
    return NextResponse.json({
      csrfToken: token,
      message: 'CSRF token generated successfully',
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
