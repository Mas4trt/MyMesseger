export const CONFIG = {
  API_GATEWAY_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  GRPC_WEB_URL: import.meta.env.VITE_GRPC_URL || 'http://localhost:9090',
  HCAPTCHA_SITE_KEY: import.meta.env.VITE_HCAPTCHA_SITE_KEY || 'f92cd4b2-f25a-4606-ac16-1d76a9d8f818',
  ROUTES: {
    LOGIN: '/login',
    CHAT: '/chat',
  }
};
