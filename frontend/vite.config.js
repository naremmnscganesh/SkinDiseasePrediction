import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:7860',
      '/admin': 'http://localhost:7860',
      '/doctor': 'http://localhost:7860',
      '/patient': 'http://localhost:7860',
      '/predict': 'http://localhost:7860',
      '/images': 'http://localhost:7860'
    }
  }
})
