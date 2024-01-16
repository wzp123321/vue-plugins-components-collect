import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
const { resolve } = require('path');
// // element-plus按需加载
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import requireTransform from 'vite-plugin-require-transform';

// // antd按需加载
// import styleImport from 'vite-plugin-style-import'
// https://vitejs.dev/config/
export default ({ mode, command }) =>
  defineConfig({
    // 开发或生产环境服务的公共基础路径
    base: './',
    // 作为静态资源服务的文件夹。
    publicDir: resolve(__dirname, 'public'),
    assetsInclude: resolve(__dirname, './src/assets'),
    resolve: {
      // 别名
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
        {
          find: 'Config',
          replacement: resolve(__dirname, 'src/config'),
        },
        {
          find: 'Components',
          replacement: resolve(__dirname, 'src/components'),
        },
        {
          find: 'Services',
          replacement: resolve(__dirname, 'src/services'),
        },
        {
          find: 'Store',
          replacement: resolve(__dirname, 'src/store'),
        },
        {
          find: 'Router',
          replacement: resolve(__dirname, 'src/router'),
        },
        {
          find: 'Utils',
          replacement: resolve(__dirname, 'src/utils'),
        },
        {
          find: 'Layouts',
          replacement: resolve(__dirname, 'src/layouts'),
        },
        {
          find: 'Pages',
          replacement: resolve(__dirname, 'src/pages'),
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
        '/energy/ems-api/': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true, //是否跨域
          rewrite: (path) => path.replace(/^\/energy\/ems-api/, ''),
        },
        '/energy-ems/': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true, //是否跨域
          rewrite: (path) => path.replace(/^\/energy-ems/, ''),
        },
        '/ems-style': {
          target: loadEnv(mode, process.cwd()).VITE_STYLE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ems-style/, ''),
        },
        '/gateway/v1/': {
          target: 'http://192.168.50.103:10130/gateway/v1/',
          changeOrigin: true, //是否跨域
          rewrite: (path) => path.replace(/^\/gateway\/v1/, ''),
        },
      },
    },
    // 打包构建选项
    build: {
      assetsDir: 'assets', // 静态资源存放路径
      sourcemap: loadEnv(mode, process.cwd()).VITE_NODE_ENV !== 'production',
      outDir: 'dist/ems-admin',
      rollupOptions: {
        // 打包拆分 -ToDo 超过一定大小再拆分
        output: {
          entryFileNames: 'js/[name].js',
          assetFileNames: 'assets/static/[name][extname]',
          chunkFileNames: 'js/[name].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
        input: {
          index: resolve(__dirname, './index.html'),
          admin: resolve(__dirname, './pConfigurationPage.html'),
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: command === 'production',
          drop_debugger: command === 'production',
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
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
      // styleImport({
      //   libs: [
      //     {
      //       libraryName: 'ant-design-vue',
      //       esModule: true,
      //       resolveStyle: (name) => {
      //         return `ant-design-vue/es/${name}/style/index`
      //       }
      //     }
      //   ]
      // }),
    ],
  });
