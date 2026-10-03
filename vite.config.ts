import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base path 為 GitHub Pages repo 名稱，部署前改成你的 repo 名
export default defineConfig({
  base: '/Englist/',
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'Englist — B2 英語口說練習',
        short_name: 'Englist',
        description: '90 秒快速練習英文口說、聽力、small talk 與 business talk',
        start_url: '/Englist/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a73e8',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dictionary\.cambridge\.org\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/translate\.google\.com\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
});
