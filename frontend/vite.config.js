import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['@shadergradient/react'],
    include: ['three', 'html2canvas', '@paper-design/shaders-react'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/ping': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/quests': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/budget': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
      '/sessions': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
})
