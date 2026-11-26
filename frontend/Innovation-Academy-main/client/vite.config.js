import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET =
  process.env.VITE_LOCAL_BACKEND === 'true'
    ? 'http://localhost:5001'
    : process.env.VITE_BACKEND_URL || 'https://innovation-academy-eight.vercel.app';

export default defineConfig({
  base: '/innovation-academy/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    proxy: {
      '/api/academy': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/academy/, '/api'),
      },
      '/uploads/academy': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads\/academy/, '/uploads'),
      },
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});


