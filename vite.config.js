import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: [
      'hopefully-fix-version-fairfield.trycloudflare.com',
      'updates-shut-hour-shoe.trycloudflare.com',
      /^.*\.trycloudflare\.com$/
    ]
  }
})