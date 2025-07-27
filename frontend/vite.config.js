import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/notifications': {
        target: 'http://localhost:3000',
        changeOrigin: true, // ✅ Nécessaire pour les headers CORS
        rewrite: (path) => path.replace(/^\/notifications/, '/notifications'), // Conserve le chemin
        secure: false, // Désactive la vérification SSL en dev
      },
      // Appliquez la même config aux autres routes
      '/demandesortie': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/demandesortie/, '/demandesortie'),
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
