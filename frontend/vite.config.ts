import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa dependencias estables en chunks cacheables: el navegador las
        // reutiliza entre navegaciones y las descarga en paralelo con el codigo
        // de cada pagina. Leaflet (mapa GPS) queda aislado para no inflar el resto.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5181,
    allowedHosts: true,
  },
})
