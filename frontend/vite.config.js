import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Unified TRACE Projects Frontend (Events, Spaces, Community, Innovation Academy, Projects)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router') || id.includes('@remix-run')) {
                return 'vendor-router';
              }
              if (id.includes('react-dom') || id.includes('/react/') || id.includes('\\react\\') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('axios')) {
                return 'vendor-axios';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('dompurify')) {
                return 'vendor-sanitize';
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
      port: 4000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
