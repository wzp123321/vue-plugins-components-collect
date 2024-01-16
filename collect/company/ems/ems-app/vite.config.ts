import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import uni from '@dcloudio/vite-plugin-uni';
import requireTransform from 'vite-plugin-require-transform';

// https://vitejs.dev/config/
export default ({ mode, command }) =>
  defineConfig({
    base: '/energy/emsHtmlUni/',
    plugins: [
      uni(),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
    ],
    server: {
      port: 19527,
      proxy: {
        '/energy/ems-api/': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true, //是否跨域
          rewrite: (path) => path.replace(/^\/energy\/ems-api/, ''),
        },
      },
    },
    resolve: {
      // 别名
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
      ],
      // 支持的后缀
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    // 打包构建选项
    build: {
      // assetsDir: 'assets', // 静态资源存放路径
      // sourcemap: loadEnv(mode, process.cwd()).VITE_NODE_ENV !== 'production',
      // rollupOptions: {
      //   // 打包拆分 -ToDo 超过一定大小再拆分
      //   output: {
      //     entryFileNames: 'js/[name].js',
      //     assetFileNames: 'assets/static/[name][extname]',
      //     chunkFileNames: 'js/[name].js',
      //     // manualChunks(id) {
      //     //   if (id.includes('node_modules')) {
      //     //     return id.toString().split('node_modules/')[1].split('/')[0].toString();
      //     //   }
      //     // },
      //   },
      // },
      // minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: command === 'production',
          drop_debugger: command === 'production',
        },
      },
    },
  });
