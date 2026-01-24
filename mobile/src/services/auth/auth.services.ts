import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { httpNextPublic, httpPrivate } from '../axiosConfig';
import {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    ApiResponse,
    ApiError,
    User,
} from './auth.types';
import { tokenStorage } from './token.storage';
import { extractTokensFromCookies } from './cookie.utils';
import { API_ENDPOINTS } from '@/utils/api.endpoints';

/**
 * Extract error message from axios error response
 */
const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError | undefined;
        if (apiError?.message) {
            return apiError.message;
        }
        if (apiError?.errors) {
            // Extract first validation error
            const firstError = Object.values(apiError.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
                return firstError[0];
            }
        }
        return error.message || 'An unexpected error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

/**
 * Authentication Service Class
 * Handles all authentication-related API calls
 */
class AuthService {
    /**
     * Register a new user.
     * Extracts access & refresh tokens from Set-Cookie response headers and stores in AsyncStorage.
     */
    async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse['data']>> {
        try {
            const response = await httpNextPublic.post<ApiResponse<AuthResponse['data']>>(
                API_ENDPOINTS.AUTH_SIGNUP,
                data
            );

            const { accessToken, refreshToken } = extractTokensFromCookies(response);
            if (accessToken && refreshToken) {
                await tokenStorage.setTokens(accessToken, refreshToken);
            }

            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Login user.
     * Extracts access & refresh tokens from Set-Cookie response headers and stores in AsyncStorage.
     */
    async login(data: LoginRequest): Promise<ApiResponse<AuthResponse['data']>> {
        try {
            const response = await httpNextPublic.post<ApiResponse<AuthResponse['data']>>(
                API_ENDPOINTS.AUTH_LOGIN,
                data
            );

            const { accessToken, refreshToken } = extractTokensFromCookies(response);
            if (accessToken && refreshToken) {
                await tokenStorage.setTokens(accessToken, refreshToken);
            }

            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(
        data: ForgotPasswordRequest
    ): Promise<ApiResponse<{ message: string }>> {
        try {
            const response = await httpNextPublic.post<ApiResponse<{ message: string }>>(
                API_ENDPOINTS.AUTH_FORGOT_PASSWORD,
                data
            );
            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(
        data: ResetPasswordRequest
    ): Promise<ApiResponse<{ message: string }>> {
        try {
            const response = await httpNextPublic.post<ApiResponse<{ message: string }>>(
                API_ENDPOINTS.AUTH_RESET_PASSWORD,
                data
            );
            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Logout user. Calls logout API (Bearer), then clears tokens from AsyncStorage.
     */
    async logout(): Promise<void> {
        try {
            await httpPrivate.post(API_ENDPOINTS.AUTH_LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await tokenStorage.clearTokens();
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<ApiResponse<AuthResponse['data']>> {
        try {
            const response = await httpPrivate.get<ApiResponse<AuthResponse['data']>>(API_ENDPOINTS.AUTH_ME);
            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Refresh access token.
     * Sends refresh token via Cookie header, parses new tokens from Set-Cookie, stores in AsyncStorage.
     * Prefer relying on axios 401 interceptor for automatic refresh; use this for explicit refresh.
     */
    async refreshToken(): Promise<ApiResponse<{ message: string }>> {
        try {
            const refresh = await tokenStorage.getRefreshToken();
            if (!refresh) throw new Error('No refresh token');

            const response = await httpNextPublic.post<ApiResponse<{ message: string }>>(
                API_ENDPOINTS.AUTH_TOKEN_REFRESH,
                {},
                { headers: { Cookie: `refresh_token=${refresh}` } }
            );

            const { accessToken, refreshToken } = extractTokensFromCookies(response);
            if (accessToken && refreshToken) {
                await tokenStorage.setTokens(accessToken, refreshToken);
            }

            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Check if user is authenticated (Bearer token in AsyncStorage; validated via /me).
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            await this.getCurrentUser();
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

/**
 * Shared queryFn for user profile. Fetches /me and returns User | null.
 */
const userProfileQueryFn = async (): Promise<User | null> => {
    const response = await authService.getCurrentUser();
    if (!response.success) throw new Error(response.message);
    return response.data?.user ?? null;
};

/**
 * Fetch and cache current user. Use after login/register to populate user profile.
 */
export const useUserProfile = () => {
    return useQuery<User | null, Error>({
        queryKey: ['user'],
        queryFn: userProfileQueryFn,
    });
};

export const useSignIn = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse['data'], Error, LoginRequest>({
        mutationFn: async (data: LoginRequest) => {
            const response = await authService.login(data);
            if (!response.success) throw new Error(response.message);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.fetchQuery({ queryKey: ['user'], queryFn: userProfileQueryFn });
        },
        onError: (error: Error) => {
            console.error('Login error:', error);
        },
    });
};

export const useSignUp = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse['data'], Error, RegisterRequest>({
        mutationFn: async (data: RegisterRequest) => {
            const response = await authService.register(data);
            if (!response.success) throw new Error(response.message);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.fetchQuery({ queryKey: ['user'], queryFn: userProfileQueryFn });
        },
        onError: (error: Error) => {
            console.error('Registration error:', error);
        },
    });
};

export const useForgotPassword = () => {
    return useMutation<{ message: string }, Error, ForgotPasswordRequest>({
        mutationFn: async (data: ForgotPasswordRequest) => {
            const response = await authService.forgotPassword(data);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        onError: (error: Error) => {
            console.error('Forgot password error:', error);
        },
    });
};

export const useResetPassword = () => {
    return useMutation<{ message: string }, Error, ResetPasswordRequest>({
        mutationFn: async (data: ResetPasswordRequest) => {
            const response = await authService.resetPassword(data);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        onError: (error: Error) => {
            console.error('Reset password error:', error);
        },
    });
};

export const useSignOut = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            await authService.logout();
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['user'] });
        },
        onError: (error: Error) => {
            console.error('Logout error:', error);
            queryClient.removeQueries({ queryKey: ['user'] });
        },
    });
};