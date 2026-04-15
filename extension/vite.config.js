import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // critical for Chrome Extensions to resolve relative static assets!
  build: {
    outDir: 'dist',
  }
})
