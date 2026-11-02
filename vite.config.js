import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Netlify 및 GitHub Pages 배포 경로 호환
  plugins: [react(), tailwindcss()],
})
