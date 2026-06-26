import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Forward all /api/* calls to the Flask backend so the React app
    // can call the same endpoints without CORS issues during development.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Resolve the src directory as the root for imports so you can use
  // absolute paths like '@/components/...' instead of relative paths.
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
