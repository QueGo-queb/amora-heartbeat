import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // ✅ CORRIGÉ: Base path flexible selon l'environnement
  server: {
    host: "::",
    port: 8080,
  },
  
  // ✅ AJOUT: Optimisations pour la production
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.3'),
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
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  
  build: {
    minify: 'terser',
    sourcemap: mode === 'production' ? false : true, // ✅ OPTIMISÉ: Pas de sourcemap en prod
    target: 'es2015', // ✅ OPTIMISÉ: Support navigateurs modernes
    chunkSizeWarningLimit: 1000, // ✅ OPTIMISÉ: Limite de taille de chunk
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'zustand'],
          // ✅ OPTIMISÉ: Séparer les composants lourds
          charts: ['recharts'],
          animations: ['framer-motion', 'react-spring'],
        },
        // ✅ OPTIMISÉ: Noms de fichiers avec hash pour le cache
        entryFileNames: mode === 'production' ? 'assets/[name].[hash].js' : '[name].js',
        chunkFileNames: mode === 'production' ? 'assets/[name].[hash].js' : '[name].js',
        assetFileNames: mode === 'production' ? 'assets/[name].[hash].[ext]' : '[name].[ext]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.warn', 'console.info'] : [],
      },
      mangle: {
        safari10: true, // ✅ OPTIMISÉ: Support Safari 10+
      },
    },
  },
  
  // ✅ OPTIMISÉ: Suppression des console en production
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
