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
      '.trycloudflare.com',          // Cloudflare quick tunnels
      '.loca.lt',                    // localtunnel
      '.serveousercontent.com'       // serveo.net
    ]
  }
})