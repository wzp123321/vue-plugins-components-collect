import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Inspect from 'vite-plugin-inspect';
import mkcert from 'vite-plugin-mkcert';
import glob from 'fast-glob';
import VueMacros from 'unplugin-vue-macros/vite';
import esbuild from 'rollup-plugin-esbuild';
import {
  epPackage,
  epRoot,
  getPackageDependencies,
  pkgRoot,
  projRoot,
} from '@element-plus/build-utils';
import type { Plugin } from 'vite';
import './vite.init';

const esbuildPlugin = (): Plugin => ({
  ...esbuild({
    target: 'chrome64',
    include: /\.vue$/,
    loaders: {
      '.vue': 'js',
    },
  }),
  enforce: 'post',
});

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let { dependencies } = getPackageDependencies(epPackage);
  dependencies = dependencies.filter((dep) => !dep.startsWith('@types/')); // exclude dts deps
  const optimizeDeps = (
    await glob(['dayjs/(locale|plugin)/*.js'], {
      cwd: path.resolve(projRoot, 'node_modules'),
    })
  ).map((dep) => dep.replace(/\.js$/, ''));

  return {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
    },
    resolve: {
      dedupe: ['vue'],
      alias: [
        {
          find: '@/components',
          replacement: path.resolve(projRoot, 'packages/components'),
        },
        // {
        //   find: /^element-plus\/(es|lib)\/(.*)$/,
        //   replacement: `${pkgRoot}/$2`,
        // },
      ],
    },
    server: {
      host: true,
      https: !!env.HTTPS,
      proxy: {
        '/energy/ims-api': {
          target: 'http://192.168.50.141:10130/energy/ims-api',
          changeOrigin: true, // 是否跨域
          rewrite: (path) => path.replace(/^\/energy\/ims-api/, ''),
        },
      },
    },
    plugins: [
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue(),
          vueJsx: vueJsx(),
        },
      }),
      esbuildPlugin(),
      Components({
        include: `${__dirname}/**`,
        resolvers: ElementPlusResolver({ importStyle: 'sass' }),
        dts: false,
      }),
      mkcert(),
      Inspect(),
    ],
    optimizeDeps: {
      include: ['vue', '@vue/shared'],
    },
    esbuild: {
      target: 'chrome64',
    },
  };
});
