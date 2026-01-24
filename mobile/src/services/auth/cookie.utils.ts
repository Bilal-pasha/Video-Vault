import { AxiosResponse } from "axios";

/**
 * Cookie names must match server (app.constants COOKIE_NAMES)
 */
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
/**
 * Extract tokens from Set-Cookie header in response
 * @param response - Axios response object
 * @returns Object with access_token and refresh_token if found
 */
export const extractTokensFromCookies = (
  response: AxiosResponse
): { accessToken: string | null; refreshToken: string | null } => {
  const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
  if (!setCookieHeader) {
    return { accessToken: null, refreshToken: null };
  }

  // Handle both array and string formats
  const cookieString = Array.isArray(setCookieHeader)
    ? setCookieHeader.join(', ')
    : setCookieHeader;

  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  // Parse cookies - extract token values (everything between name= and first semicolon)
  const accessTokenMatch = cookieString.match(/access_token=([^;]+)/);
  const refreshTokenMatch = cookieString.match(/refresh_token=([^;]+)/);

  if (accessTokenMatch && accessTokenMatch[1]) {
    accessToken = accessTokenMatch[1].trim();
  }

  if (refreshTokenMatch && refreshTokenMatch[1]) {
    refreshToken = refreshTokenMatch[1].trim();
  }

  return { accessToken, refreshToken };
};