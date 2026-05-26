import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
})
