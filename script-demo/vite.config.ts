import { loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { UserConfigExport, ConfigEnv } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import stylelintPlugin from 'vite-plugin-stylelint';
import viteCompression from 'vite-plugin-compression';
import ViteRestart from 'vite-plugin-restart';

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_APP_BASE, // 公共基础路径
    plugins: [
      vue(), // 构建压缩文件
      vueJsx(),
      eslintPlugin(),
      stylelintPlugin({ fix: true }),
      ViteRestart({
        restart: ['vite.config.ts'],
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 即10kb以上即会压缩
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    optimizeDeps: {
      exclude: ['dompurify', 'canvg'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/styles/variable.scss" as *;
          `,
        },
      },
    },
    build: {
      // 启用 CSS 代码分割，但确保样式按正确顺序加载
      // 这样可以避免 Jenkins 打包后 CSS 加载顺序导致的 z-index 层级问题
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          dir: 'sec-web',
          entryFileNames: 'static/js/[name]-[hash].js',
          chunkFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // 确保 CSS 文件输出到正确的目录，保持加载顺序
            if (assetInfo.name?.endsWith('.css')) {
              return 'static/css/[name]-[hash][extname]';
            }
            return 'static/[ext]/[name]-[hash][extname]';
          },
          manualChunks(id) {
            // 静态资源分拆打包
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
            }
            return null;
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 2048,
    },
    server: {
      host: '0.0.0.0',
      port: 8899,
      proxy: {
        '/gateway': {
          target: 'http://192.168.50.141:10130', // 本地服务
          changeOrigin: true, // 是否跨域
          rewrite: (path) => path.replace(/^\/secBff\/gateway/, '/gateway'),
        },
        // 规则2: 特定接口的代理
        '/bff/nursing/hlms/openapi/dgmp': {
          target: 'http://192.168.50.141:10130',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              '/bff/nursing/hlms/openapi/dgmp/',
              '/hlms/openapi/dgmp/',
            ),
        },
        '/bff/nursing/hlms/openapi/portal': {
          target: 'http://192.168.50.141:10130',
          changeOrigin: true,
        },
        '/bff/nursing': {
          target: 'http://192.168.50.141:10130',
          changeOrigin: true,
        },
      },
    },
  };
};
