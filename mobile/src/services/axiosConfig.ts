import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { djangoApiBaseUrl, nextBackendApiBaseUrl } from '@/utils/env';
import { PublicRoutes } from '@/constants/routes';

import { DJANGO_API_ENDPOINTS } from '@/utils/api.endpoints';
import { getItem, multiRemove, setItem, STORAGE_KEYS } from '@/utils/asyncStorage/index';

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

// Next.js Backend API instance (for Next.js API routes)
export const httpNextPublic: AxiosInstance = axios.create({
  baseURL: nextBackendApiBaseUrl,
});

// Public axios instance for unauthenticated requests
export const httpPublic: AxiosInstance = axios.create({
  baseURL: djangoApiBaseUrl,
});

// Private axios instance for authenticated requests
export const httpPrivate: AxiosInstance = axios.create({
  baseURL: djangoApiBaseUrl,
});

// Request interceptor to attach auth token
httpPrivate.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Redirect to sign in page
const redirectToSignInPage = async (): Promise<void> => {
  await multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
  // Use Expo Linking to navigate to sign in
  // Note: In a component, you would use useRouter from expo-router
  // This is a utility function, so we'll handle navigation in the component
  // For now, we'll just clear tokens
};

export const userSignOutFn = async (): Promise<void> => {
  try {
    await httpPrivate.post(DJANGO_API_ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Continue with sign out even if API call fails
  } finally {
    await redirectToSignInPage();
  }
};

export const refreshAccessTokenFn = async (): Promise<unknown> => {
  try {
    const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      await redirectToSignInPage();
      return null;
    }

    const response = await httpPublic.post(DJANGO_API_ENDPOINTS.AUTH_TOKEN_REFRESH, {
      refresh: refreshToken,
    });

    // Extract tokens from Set-Cookie header
    const { accessToken, refreshToken: newRefreshToken } = extractTokensFromCookies(response);

    if (accessToken) {
      await setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (newRefreshToken) {
      await setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    }

    return response;
  } catch {
    await redirectToSignInPage();
    return null;
  }
};

// Response interceptor to handle 401 errors and token refresh
httpPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !Object.values(PublicRoutes).some((route) => originalRequest.url?.includes(route))
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessTokenFn();
        // Retry the original request with new token
        const token = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return httpPrivate(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to sign in
        await redirectToSignInPage();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);