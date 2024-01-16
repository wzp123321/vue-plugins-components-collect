import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
const { resolve } = require('path');

export default ({ mode, command }) =>
  defineConfig({
    // 开发或生产环境服务的公共基础路径
    base: loadEnv(mode, process.cwd()).VITE_PUBLIC_PATH,
    // 作为静态资源服务的文件夹。
    publicDir: resolve(__dirname, 'public'),
    assetsInclude: resolve(__dirname, './src/assets'),
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
    // less javascriptEnabled
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
    // 开发选项
    server: {
      port: Number(loadEnv(mode, process.cwd()).VITE_DEV_SERVER_PORT),
      host: '0.0.0.0',
      fs: {
        strict: false, // 解决Unrestricted file system access  vite对根目录的访问做了限制
      },
      proxy: {
        '/api': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true, //是否跨域
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ems-style': {
          target: loadEnv(mode, process.cwd()).VITE_STYLE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ems-style/, ''),
        },
      },
    },
    // 打包构建选项
    build: {
      assetsDir: 'assets', // 静态资源存放路径
      sourcemap: loadEnv(mode, process.cwd()).VITE_NODE_ENV !== 'production',
      outDir: 'dist/cloud-container',
      rollupOptions: {
        // 打包拆分 -ToDo 超过一定大小再拆分
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: command !== 'dev',
          drop_debugger: command !== 'dev',
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  });
