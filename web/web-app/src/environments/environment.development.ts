export const environment = {
  production: false,
  development: true,
  quarkusApiUrl: '/api',
  // Development-specific settings
  enableTokenRefresh: true,
  tokenRefreshInterval: 50 * 60 * 1000, // 50 minutes
  preserveAuthState: true
};
