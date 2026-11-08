import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo-white.png', 'logo-green.png'],
      manifest: {
        name: 'Mon catalogue des possibles',
        short_name: 'Mes possibles',
        description: 'Découvre et reconnais tes capacités, compétences et qualités. EJP Cotonou.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#103b33',
        theme_color: '#103b33',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Coquille de l'app, catalogue, logos et polices latines : disponibles hors connexion dès la première visite.
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2,mjs}'],
        // pdfmake et pdf.js (lourds) ne sont pas préchargés : mis en cache à la première ouverture de l'export.
        globIgnores: [
          '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,devanagari,latin-ext}-*',
          '**/assets/pdfmake-*.js',
          '**/assets/pdf-*.js',
          '**/assets/pdf.worker*',
        ],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: { cacheName: 'assets', expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
  build: { target: 'es2020', chunkSizeWarningLimit: 1500 },
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
  },
})
