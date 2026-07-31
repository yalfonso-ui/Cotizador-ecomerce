import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Ecommerce-lemonade/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.trycloudflare.com'  // acepta cualquier subdominio de trycloudflare.com
    ]
  }
})