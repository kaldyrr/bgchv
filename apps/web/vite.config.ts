import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [qwikCity(), qwikVite()],
  resolve: {
    alias: {
      '@crm/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@crm/model': path.resolve(__dirname, '../../packages/model/src')
    }
  },
  server: {
    port: 5173,
    hmr: { overlay: false }
  }
});
