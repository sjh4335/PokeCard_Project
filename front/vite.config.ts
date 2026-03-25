import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 요청을 보내면 백엔드(8080)로 전달합니다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 주소에서 '/api'를 제거하고 백엔드에 전달하고 싶다면 아래 주석 해제
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    outDir: '../back/src/main/resources/static',
    emptyOutDir: true,
  },
})
