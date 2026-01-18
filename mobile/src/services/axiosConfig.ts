import axios, { AxiosInstance } from 'axios';

import { backendApiBaseUrl } from '@/utils/env';

import { API_ENDPOINTS } from '@/utils/api.endpoints';

// Public axios instance for unauthenticated requests
export const httpPublic: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
});

// Private axios instance for authenticated requests
export const httpPrivate: AxiosInstance = axios.create({
  baseURL: backendApiBaseUrl,
  withCredentials: true,
});

// Alias for backward compatibility
export const httpNextPublic = httpPublic;

export const userSignOutFn = async (): Promise<void> => {
  try {
    await httpPrivate.post(API_ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Continue with sign out even if API call fails
    // Cookies will be cleared by the backend
  }
};


httpPrivate.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => {
    if (error.response.status === 401) {
      userSignOutFn();
    }
    return Promise.reject(error);
  }
);