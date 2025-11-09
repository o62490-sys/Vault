import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: process.env.BUILD_DIR || 'build/web',
    emptyOutDir: false,
    rollupOptions: {
      external: process.env.BUILD_DIR === 'build/mobile'
        ? ['@tauri-apps/api', '@tauri-apps/plugin-fs', '@tauri-apps/plugin-shell', '@tauri-apps/api/path', '@tauri-apps/plugin-sql']
        : ['@tauri-apps/api', '@tauri-apps/plugin-fs', '@tauri-apps/plugin-shell', '@tauri-apps/api/path', '@capacitor/preferences', '@aparajita/capacitor-biometric-auth', '@tauri-apps/plugin-sql'],
      output: {
        manualChunks: undefined,
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'otpauth', 'react-qr-code'],
    exclude: ['@tauri-apps/api', '@tauri-apps/plugin-fs', '@tauri-apps/plugin-shell', '@tauri-apps/api/path']
  },
  define: {
    global: 'globalThis',
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
