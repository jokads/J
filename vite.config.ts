import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const base = '/'; // usar CNAME / root

  console.log('VITE: mode=', mode, ' base=', base);

  return {
    base,
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    define: {
      __BASE_PATH__: JSON.stringify(base),
      __IS_PRODUCTION__: JSON.stringify(isProd),
      __PROJECT_ID__: JSON.stringify(env.VITE_PROJECT_ID ?? ''),
    },

    build: {
      outDir: 'out',
      emptyOutDir: true,
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      rollupOptions: {
        // força o index.html como entry — evita erro "Could not resolve entry module index.html"
        input: path.resolve(__dirname, 'index.html'),
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    },
  };
});
