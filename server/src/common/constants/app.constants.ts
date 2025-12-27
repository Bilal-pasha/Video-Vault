export const DEFAULT_PORT = 8000;

export const CORS_CONFIG = {
  ORIGIN: process.env.CORS_ORIGIN || true,
  CREDENTIALS: true,
};

export const VALIDATION_CONFIG = {
  WHITELIST: true,
  FORBID_NON_WHITELISTED: true,
};
