import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://fullstacktodo-production-7fec.up.railway.app/', // 后端地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), //TODO 有什么用
      },
    },
  },
})
