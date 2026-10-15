import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: Capacitor sirve los archivos desde el propio APK
export default defineConfig({
  base: './',
  plugins: [react()],
})
