import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/academy': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/academy/, '/api'),
      },
      '/uploads/academy': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads\/academy/, '/uploads'),
      },
      '/community': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      '/innovation-academy': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 300000,
        proxyTimeout: 300000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  success: false,
                  message: 'Backend server not running. Start server with: node app.js in backend/Event-and-Space folder.',
                })
              );
            }
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Image upload not accessible' }));
            }
          });
        },
      },
    },
  },
})
