import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { backendApiBaseUrl } from '@/utils/env';
import { API_ENDPOINTS } from '@/utils/api.endpoints';

import { tokenStorage } from './auth/token.storage';
import { extractTokensFromCookies } from './auth/cookie.utils';

// Public axios instance for unauthenticated requests
export const httpPublic: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
});

// Private axios instance for authenticated requests (Bearer token)
export const httpPrivate: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
});

// Alias for backward compatibility
export const httpNextPublic = httpPublic;

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await axios.post(
      `${backendApiBaseUrl}${API_ENDPOINTS.AUTH_TOKEN_REFRESH}`,
      {},
      {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
        validateStatus: () => true,
      }
    );

    if (res.status !== 200) return false;

    const { accessToken: newAccess, refreshToken: newRefresh } =
      extractTokensFromCookies(res);
    if (!newAccess || !newRefresh) return false;

    await tokenStorage.setTokens(newAccess, newRefresh);
    return true;
  } catch {
    return false;
  } finally {
    refreshPromise = null;
  }
}

/** Clears tokens only. Used by 401 interceptor. Does not call logout API. */
export const userSignOutFn = async (): Promise<void> => {
  await tokenStorage.clearTokens();
};

// Attach Bearer token to outgoing requests
httpPrivate.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401: try refresh, retry request or sign out
httpPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        await userSignOutFn();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshTokens();
    }
    const refreshed = await refreshPromise;
    if (!refreshed) {
      await userSignOutFn();
      return Promise.reject(error);
    }

    const token = await tokenStorage.getAccessToken();
    if (token) {
      originalRequest.headers.Authorization = `Bearer ${token}`;
    }
    return httpPrivate(originalRequest);
  }
);
