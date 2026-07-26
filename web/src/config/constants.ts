export const CONFIG = {
  API_GATEWAY_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  GRPC_WEB_URL: import.meta.env.VITE_GRPC_URL || 'http://localhost:9090',
  CAPTCHA_SITE_KEY: import.meta.env.VITE_TURNSTILE_KEY || 'YOUR_SITE_KEY',
  ROUTES: {
    LOGIN: '/login',
    CHAT: '/chat',
  }
};