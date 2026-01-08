import axios, { AxiosInstance } from 'axios';

import { backendApiBaseUrl } from '@/utils/env';

import { API_ENDPOINTS } from '@/utils/api.endpoints';
import { multiRemove, STORAGE_KEYS } from '@/utils/asyncStorage/index';

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
