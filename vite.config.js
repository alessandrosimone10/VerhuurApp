import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Optioneel: als je Base44 plugin gebruikt (je kunt het weglaten als je het niet nodig hebt)
// import base44 from "@base44/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    // base44(), // Uncomment als je de Base44 plugin nodig hebt
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.base44.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
