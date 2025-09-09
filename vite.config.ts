import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Plugin de développement seulement
    mode === 'development' && componentTagger(),
    // Plugin Sentry pour production
    mode === 'production' && sentryVitePlugin({
      org: "your-sentry-org",
      project: "amora",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    // Configuration PWA optimisée avec Workbox
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // API Supabase - Stale While Revalidate
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 heures
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`;
              },
            },
          },
          // Images - Cache First avec fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
          // Assets statiques - Cache First
          {
            urlPattern: /\.(?:js|css|woff2|woff|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
              },
            },
          },
          // Pages HTML - Network First avec cache fallback
          {
            urlPattern: /\.(?:html)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 heures
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AMORA - Rencontres pour Célibataires',
        short_name: 'AMORA',
        description: 'Trouvez l\'amour sans frontières sur Amora, la plateforme de rencontre dédiée aux célibataires haïtiens, latinos, caribéens et africains.',
        theme_color: '#8B1538',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  // Optimisations production
  define: {
    ...(mode === 'production' && {
      'console.log': '(() => {})',
      'console.debug': '(() => {})',
      'console.warn': '(() => {})',
    }),
  },
  
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'zustand'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.warn'],
      },
    },
  },
  
  // Optimisations générales
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
