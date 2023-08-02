import { resolve } from 'path';
import { loadEnv } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import DefineOptions from 'unplugin-vue-define-options/vite';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import type { UserConfig, ConfigEnv } from 'vite';

const CWD = process.cwd();

export default ({ mode }: ConfigEnv): UserConfig => {
  // 环境变量
  const { VITE_BASE_URL, VITE_DROP_CONSOLE } = loadEnv(mode, CWD);

  return {
    base: VITE_BASE_URL,
    esbuild: {
      // target: 'es2015'
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
      ],
    },
    plugins: [
      vue(),
      DefineOptions(), // https://github.com/sxzz/unplugin-vue-define-options
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      Components({
        resolvers: [VantResolver()],
      }),

      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: true,
        // vueTsc: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{.vue,ts,tsx}"', // for example, lint .ts & .tsx
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {},
          javascriptEnabled: true,
        },
      },
      // TODO 构建包含@charset问题 https://github.com/vitejs/vite/issues/5833
      // postcss: {
      //   plugins: [
      //     {
      //       postcssPlugin: 'internal:charset-removal',
      //       AtRule: {
      //         charset: (atRule) => {
      //           if (atRule.name === 'charset') {
      //             atRule.remove();
      //           }
      //         },
      //       },
      //     },
      //   ],
      // },
    },
    server: {
      port: 8888,
      proxy: {
        '/api': {
          // 免费的在线REST API
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    optimizeDeps: {
      include: ['vant', '@vant/touch-emulator'],
      exclude: ['vue-demi'],
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: Object.is(VITE_DROP_CONSOLE, 'true'),
        },
      },
    },
  };
};
