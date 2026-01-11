import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        replaceAttrValues: {
        '#000': 'currentColor',
        '#505050': 'currentColor',
        '#E6E6E6': 'currentColor',
        '#000000': 'currentColor',
        'black': 'currentColor'
        }
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://52.79.92.161:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})
