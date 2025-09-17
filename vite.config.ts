import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

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
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  // ✅ OPTIMISÉ: Suppression automatique des console.log en production
  define: {
    ...(mode === 'production' && {
      'console.log': '(() => {})',
      'console.debug': '(() => {})',
      'console.warn': '(() => {})',
      'console.info': '(() => {})',
      'console.trace': '(() => {})',
      'console.table': '(() => {})',
      'console.group': '(() => {})',
      'console.groupEnd': '(() => {})',
      'console.time': '(() => {})',
      'console.timeEnd': '(() => {})',
      'console.count': '(() => {})',
      'console.clear': '(() => {})'
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
          // ✅ OPTIMISÉ: Séparer les composants lourds
          charts: ['recharts'],
          animations: ['framer-motion', 'react-spring'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.warn', 'console.info'] : [],
      },
    },
  },
  
  // ✅ OPTIMISÉ: Suppression des console en production
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
