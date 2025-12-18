import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5800,
    proxy: {
      '/base': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/bzss': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
