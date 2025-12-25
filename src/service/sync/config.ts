// src/service/sync/config.ts
export const SYNC_CONFIG = {
  enableLogging: import.meta.env.DEV,
  timeThreshold: 60000,
  changeThreshold: 10,
  debounceDelay: 5000,
  maxRetries: 3,
  retryDelay: 5000,
  appSecret: import.meta.env.VITE_APP_SECRET_KEY,
}
