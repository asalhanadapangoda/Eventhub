import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/community/',
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    host: true,
  }
});

