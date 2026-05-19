import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      }
    ]),
    renderer(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'build.png'],
      manifest: {
        name: 'StreamBible',
        short_name: 'StreamBible',
        description: 'Multilingual lower-third Bible verse overlays.',
        theme_color: '#0A84FF',
        background_color: '#0E0E11',
        display: 'standalone',
        icons: [
          {
            src: 'build.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'build.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
