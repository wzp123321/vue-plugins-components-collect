import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 2333,
    proxy: {
      '/api': {
        target: 'http://192.168.50.24:8200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'web-core',
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'lib',
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['vue'],
  },
});
