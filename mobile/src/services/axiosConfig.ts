import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { backendApiBaseUrl } from '@/utils/env';
import { PublicRoutes } from '@/constants/routes';

import { API_ENDPOINTS } from '@/utils/api.endpoints';
import { getItem, multiRemove, setItem, STORAGE_KEYS } from '@/utils/asyncStorage/index';

// Public axios instance for unauthenticated requests
export const httpPublic: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
});

// Private axios instance for authenticated requests
export const httpPrivate: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
});

// Alias for backward compatibility
export const httpNextPublic = httpPublic;

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
    await httpPrivate.post(API_ENDPOINTS.AUTH_LOGOUT);
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

    const response = await httpPublic.post<{
      success: boolean;
      message: string;
      data: {
        token: string;
        refreshToken?: string;
      };
    }>(API_ENDPOINTS.AUTH_TOKEN_REFRESH, {
      refreshToken,
    });

    // Extract tokens from response body (NestJS returns JSON, not cookies)
    if (response.data.success && response.data.data) {
      await setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.token);
      if (response.data.data.refreshToken) {
        await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken);
      }
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