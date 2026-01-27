import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { googleAuthService } from './google-auth.service';
import { AuthResponse, ApiError } from './auth.types';

/**
 * Extract error message from error response
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Hook for Google Sign-In
 * Handles authentication with Google OAuth
 */
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse['data'], Error, void>({
    mutationFn: async () => {
      const response = await googleAuthService.signInWithGoogle();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: async (data) => {
      // Update user cache with authenticated user data
      if (data?.user) {
        queryClient.setQueryData(['user'], data.user);
      }
    },
    onError: (error: Error) => {
      console.error('Google Sign-In error:', error);
    },
  });
};

/**
 * Hook for Google Sign-Out
 * Signs out from Google and clears local session
 */
export const useGoogleSignOut = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await googleAuthService.signOut();
    },
    onError: (error: Error) => {
      console.error('Google Sign-Out error:', error);
    },
  });
};
