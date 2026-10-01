import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Lokal ishlash: backend http://127.0.0.1:8000 da. Boshqa joyda bo'lsa: BACKEND_URL=... npm run dev
const backend = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/plat': backend,
      '/media': backend,
    },
  },
})
