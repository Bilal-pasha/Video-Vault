export const API_ENDPOINTS = {
  AUTH_LOGIN: '/v1/api/auth/login',
  AUTH_SIGNUP: '/v1/api/auth/signup',
  AUTH_LOGOUT: '/v1/api/auth/logout',
  AUTH_TOKEN_REFRESH: '/v1/api/auth/token/refresh',
  AUTH_ME: '/v1/api/auth/me',
  AUTH_FORGOT_PASSWORD: '/v1/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/v1/api/auth/reset-password',
  AUTH_VERIFY_OTP: '/v1/api/auth/verify-otp',
  AUTH_RESEND_OTP: '/v1/api/auth/resend-otp',
  AUTH_SOCIAL_GOOGLE: '/v1/api/auth/google',
  AUTH_COMPLETE_PROFILE: '/v1/api/auth/complete-profile',
} as const;