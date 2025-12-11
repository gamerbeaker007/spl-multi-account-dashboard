'use server';

import { cookies } from 'next/headers';

const TOKEN_PREFIX = 'spl_token_';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Store an encrypted token in a cookie for a specific user
 */
export async function setUserTokenCookie(username: string, encryptedToken: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = `${TOKEN_PREFIX}${username.toLowerCase()}`;

  cookieStore.set(cookieName, encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Retrieve an encrypted token from cookies for a specific user
 */
export async function getUserTokenCookie(username: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieName = `${TOKEN_PREFIX}${username.toLowerCase()}`;
  const cookie = cookieStore.get(cookieName);

  return cookie?.value || null;
}

/**
 * Remove a user's token cookie
 */
export async function removeUserTokenCookie(username: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = `${TOKEN_PREFIX}${username.toLowerCase()}`;

  cookieStore.delete(cookieName);
}

/**
 * Get all stored token cookies
 * Returns a map of username -> encrypted token
 */
export async function getAllUserTokenCookies(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const tokens: Record<string, string> = {};

  for (const cookie of allCookies) {
    if (cookie.name.startsWith(TOKEN_PREFIX)) {
      const username = cookie.name.substring(TOKEN_PREFIX.length);
      tokens[username] = cookie.value;
    }
  }

  return tokens;
}

/**
 * Clear all user token cookies
 */
export async function clearAllUserTokenCookies(): Promise<void> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith(TOKEN_PREFIX)) {
      cookieStore.delete(cookie.name);
    }
  }
}
