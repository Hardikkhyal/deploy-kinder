import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Pre-bundle known heavy deps so cold dev starts are instant
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'socket.io-client', 'axios', 'zustand'],
  },

  build: {
    // OXC is Vite 8's native minifier (rolldown-based). esbuild was removed as a
    // bundled dep in Vite 8 — using it requires a separate install and is slower anyway.
    minify: 'oxc',

    // Don't embed source maps in production (reduces bundle size significantly)
    sourcemap: false,

    // Raise the warning threshold — we're splitting deliberately
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting: each vendor group becomes a separately cached async chunk.
        // The app entry stays small (routing + core React only).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core — tiny, loads first
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Recharts + its d3 deps are heavy — split into its own chunk
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'vendor-charts';
            }
            // socket.io client
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            // lucide-react icons — large tree, split so it can be cached independently
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // axios + zustand are tiny — bundle together
            if (id.includes('axios') || id.includes('zustand')) {
              return 'vendor-utils';
            }
            // Everything else in node_modules goes to a generic vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
});
