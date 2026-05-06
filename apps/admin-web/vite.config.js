import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  cacheDir: '.vite',
  server: {
    port: 3001,
    proxy: {
      '/api/market':  'http://localhost:9090',
      '/api/orders':  'http://localhost:8080',
    },
  },
});
