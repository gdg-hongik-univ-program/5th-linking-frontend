import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); 

  return {
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
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        },
      },
    },
  }
})
