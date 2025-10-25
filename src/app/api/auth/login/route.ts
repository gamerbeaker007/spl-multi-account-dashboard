import { splLogin } from '@/lib/api/splApi';
import { validateCsrfToken } from '@/lib/auth/csrf';
import { encryptToken } from '@/lib/auth/encryption';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let username, timestamp, signature, requestBody;
    try {
      requestBody = await request.json();
      username = requestBody.username;
      timestamp = requestBody.timestamp;
      signature = requestBody.signature;
    } catch (err) {
      console.error('Failed to parse JSON body in login request', err);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Validate CSRF token
    const csrfValidation = await validateCsrfToken(request, requestBody);
    if (!csrfValidation.isValid) {
      return NextResponse.json({ error: csrfValidation.error }, { status: 403 });
    }

    // Validate required fields
    if (!username || !timestamp || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call SPL API
    const splResponse = await splLogin(username, timestamp, signature);

    // Create response
    // Check for encryption key
    if (!process.env.SECRET_ENCRYPTION_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Encrypt the token
    const encryptedToken = await encryptToken(
      splResponse.jwt_token,
      process.env.SECRET_ENCRYPTION_KEY
    );

    const response = NextResponse.json({
      success: true,
      username,
      message: 'Login successful',
      token: encryptedToken,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
