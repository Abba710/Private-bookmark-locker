import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.js'),
        'content-script': path.resolve(__dirname, 'src/content-script.js'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') {
            return 'background.js'
          }
          if (chunk.name === 'content-script') {
            return 'content-script.js'
          }
          return '[name].js'
        },
      },
    },
  },
})
