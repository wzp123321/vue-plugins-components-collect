import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

import { resolve } from 'path';
/**

@param match
Regular expression in string or Regexp type,
or a match predicate (this: vite transform context, code: string, id: file name string) => void
@returns transformed code
*/
import requireTransform from 'vite-plugin-require-transform';

/** @type {import('vite').UserConfig} */
export default ({ mode, command }) =>
  defineConfig({
    // 开发或生产环境服务的公共基础路径
    base: './',
    // 作为静态资源服务的文件夹。
    publicDir: resolve(__dirname, 'public'),
    assetsInclude: resolve(__dirname, 'src/assets'),
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
        '/energy/ems-api': {
          target: loadEnv(mode, process.cwd()).VITE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/energy\/ems-api/, ''),
        },
      },
    },
    // 打包构建选项
    build: {
      assetsDir: 'assets', // 静态资源存放路径
      sourcemap: loadEnv(mode, process.cwd()).VITE_NODE_ENV !== 'production',
      outDir: 'dist/ems-rate',
      chunkSizeWarningLimit: 1024 * 1024, // 产物限制改为1M
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media';
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = 'img';
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
      minify: 'esbuild',
    },
    plugins: [
      vue(),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
      eslintPlugin({
        include: ['src/**/*.ts', 'src/**/*.vue'],
      }),
    ],
  });
