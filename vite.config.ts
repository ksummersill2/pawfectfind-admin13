import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pawfectfind-ui',
      remotes: {
        printful: {
          external: 'https://admin.printful.pawfectfind.com/assets/remoteEntry.js',
          from: 'vite',
          format: 'esm',
          externalType: 'url'
        }
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: false
  },
  optimizeDeps: {
    exclude: ['printful/PrintfulImport']
  }
});