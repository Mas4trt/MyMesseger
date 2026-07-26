import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Все запросы, начинающиеся с /api/v1, будут уходить на Go Gateway
      '/api/v1': {
        target: 'http://localhost:8080', // Порт Go Gateway
        changeOrigin: true,
        secure: false,
      }
    }
  }
})