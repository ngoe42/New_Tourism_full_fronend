import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split stable third-party code into its own cacheable chunks, separate
        // from app code (which changes on every deploy) and from route chunks
        // (which are already split per-page via React.lazy in App.jsx).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // React/react-dom/react-router are left in the default vendor chunk —
          // carving them out separately created a circular chunk dependency with
          // other packages that reference React internally. framer-motion and
          // swiper are large and only needed by some routes, so they still get
          // their own cacheable chunks.
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('swiper')) return 'vendor-swiper'
          if (id.includes('@tanstack')) return 'vendor-query'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
