import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 飞鸟乐园 - 移动端竖屏 Canvas 游戏
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5174
  },
  build: {
    target: 'es2020',
    outDir: 'dist'
  }
})
