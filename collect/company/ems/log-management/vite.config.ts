import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
const { resolve } = require('path');

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import requireTransform from 'vite-plugin-require-transform';

export default ({ mode }) =>
  defineConfig({
    base: './',
    plugins: [
      vue(),
      //按需导入element-plus组件
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
    ],
    server: {
      host: '0.0.0.0',
      cors: true,
      proxy: {
        '/energy/log': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/energy\/log/, ''),
        },
      },
    },
    resolve: {
      // 别名
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
        },
      ],
      // 支持的后缀
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    // 打包相关规则
    build: {
      // base: './',
      outDir: 'dist/ems-log', //指定打包输出路径
      assetsDir: 'assets/static', //指定静态资源存放路径
      // assetPublicPath:'./',
      cssCodeSplit: true, //css代码拆分,禁用则所有样式保存在一个css里面
      sourcemap: loadEnv(mode, process.cwd()).VITE_NODE_ENV !== 'production', //是否构建source map 文件
      //出口文件设置
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name].js',
          assetFileNames: 'assets/static/[name][extname]',
          chunkFileNames: 'js/[name].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
            }
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        // 生产环境移除console
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  });
