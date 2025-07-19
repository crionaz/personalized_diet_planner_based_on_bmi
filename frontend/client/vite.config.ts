import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      '@/components': path.resolve('./src/components'),
      '@/pages': path.resolve('./src/pages'),
      '@/hooks': path.resolve('./src/hooks'),
      '@/utils': path.resolve('./src/utils'),
      '@/types': path.resolve('./src/types'),
      '@/store': path.resolve('./src/store'),
      '@/api': path.resolve('./src/api'),
      '@/assets': path.resolve('./src/assets'),
      '@shared': path.resolve('../../shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
