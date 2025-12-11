'use server';

import { clearAllUserTokenCookies, getUserTokenCookie, removeUserTokenCookie } from '@/lib/auth/cookies';

/**
 * Server action to retrieve a user's encrypted token from cookies
 */
export async function getTokenForUser(username: string): Promise<string | null> {
  return await getUserTokenCookie(username);
}

/**
 * Server action to logout a single user (remove their token cookie)
 */
export async function logoutUserAction(username: string): Promise<void> {
  await removeUserTokenCookie(username);
}

/**
 * Server action to logout all users (remove all token cookies)
 */
export async function logoutAllUsersAction(): Promise<void> {
  await clearAllUserTokenCookies();
}
