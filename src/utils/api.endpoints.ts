    export const DJANGO_API_ENDPOINTS = {
    AUTH_LOGIN: '/api/auth/login/',
    AUTH_SIGNUP: '/api/auth/signup/',
    AUTH_LOGOUT: '/api/auth/logout/',
    AUTH_TOKEN_REFRESH: '/api/auth/token/refresh/',
    AUTH_ME: '/api/auth/me/',
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password/',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password/',
    AUTH_VERIFY_OTP: '/api/auth/verify-otp/',
    AUTH_RESEND_OTP: '/api/auth/resend-otp/',
    AUTH_SOCIAL_GOOGLE: '/api/auth/google/',
    AUTH_COMPLETE_PROFILE: '/api/auth/complete-profile/',
  } as const;