import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Pre-bundle monaco so Rolldown never tries to parse its raw ESM dist
  // which contains unicode escape sequences that Rolldown rejects.
  optimizeDeps: {
    include: ['@monaco-editor/react', '@monaco-editor/loader'],
  },

  build: {
    // Raise the chunk-size warning threshold (monaco is inherently large)
    chunkSizeWarningLimit: 2000,
  },
})
