import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import requireTransform from 'vite-plugin-require-transform';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    // baseUrl: './',
    resolve: {
      // 别名
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
        },
        {
          find: './cptable',
          replacement: 'cptable',
        },
        // @vue-office/* 包 postinstall 不会生成 lib/index.js，强制指向 vue3 构建产物
        // CSS 路径放前面优先匹配，避免被下面 js 别名吞掉后缀
        {
          find: '@vue-office/docx/lib/index.css',
          replacement: resolve(__dirname, 'node_modules/@vue-office/docx/lib/v3/index.css'),
        },
        {
          find: '@vue-office/docx',
          replacement: resolve(__dirname, 'node_modules/@vue-office/docx/lib/v3/index.js'),
        },
        {
          find: '@vue-office/pdf',
          replacement: resolve(__dirname, 'node_modules/@vue-office/pdf/lib/v3/index.js'),
        },
        {
          find: '@vue-office/excel',
          replacement: resolve(__dirname, 'node_modules/@vue-office/excel/lib/v3/index.js'),
        },
      ],
      // 支持的后缀
      extensions: ['.js', '.ts', '.tsx', '.jsx', '.vue', '.less'],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    // 开发选项
    server: {
      port: Number(loadEnv(mode, process.cwd()).VITE_DEV_SERVER_PORT),
      host: '0.0.0.0',
      fs: {
        strict: false, // 解决Unrestricted file system access  vite对根目录的访问做了限制
      },
    },
    build: {
      sourcemap: false,
      outDir: 'dist/pluginComponent-web',
      rollupOptions: {
        output: {
          // ⚠️ 坑：不能用对象形式把 element-plus 和 vue 拆成两个 chunk——二者共享 @vue/shared 等依赖，
          // 拆分后会出现 vue.*.js import element-plus.*.js、后者又 import 前者的循环，
          // 生产包启动即报 "Cannot access 'tc' before initialization"（dev 模式不复现）。
          // 故 vue 生态 + element-plus 统一进 vue-vendor，其余大依赖单独分组。
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return;
            // ⚠️ vue 生态必须同组：拆开会因共享 @vue/shared 导致循环初始化
            // "Cannot access 'tc' before initialization"（生产包启动即报，dev 不复现）。
            if (
              /[\\/]node_modules[\\/](vue|@vue|@vueuse|element-plus|@element-plus|pinia)[\\/]/.test(id)
            ) {
              return 'vue-vendor';
            }
            // 重型图形 / 可视化 / 编辑器库单独分组，提升缓存命中、避免挤进通用 vendor
            if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three';
            if (/[\\/]node_modules[\\/](babylonjs|babylonjs-gui)[\\/]/.test(id)) return 'babylonjs';
            if (/[\\/]node_modules[\\/]d3[\\/]/.test(id)) return 'd3';
            if (/[\\/]node_modules[\\/]@antv[\\/]g6[\\/]/.test(id)) return 'antv-g6';
            if (/[\\/]node_modules[\\/]@visactor[\\/]vchart[\\/]/.test(id)) return 'vchart';
            if (/[\\/]node_modules[\\/](vxe-table|vxe-pc-ui|xe-utils)[\\/]/.test(id)) return 'vxe';
            if (/[\\/]node_modules[\\/]@tiptap[\\/]/.test(id)) return 'tiptap';
            if (/[\\/]node_modules[\\/](codemirror|@codemirror)[\\/]/.test(id)) return 'codemirror';
            if (/[\\/]node_modules[\\/]@logicflow[\\/]/.test(id)) return 'logicflow';
            if (/[\\/]node_modules[\\/]frappe-gantt[\\/]/.test(id)) return 'frappe-gantt';
            if (/[\\/]node_modules[\\/]@vue-office[\\/]/.test(id)) return 'vue-office';
            if (id.includes('echarts') || id.includes('zrender')) return 'echarts';
            if (id.includes('axios')) return 'axios';
            if (id.includes('vue3-slide-verify')) return 'vue3-slide-verify';
            return;
          },
          entryFileNames: 'js/[name].[hash].js', // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: 'js/[name].[hash].js', // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: '[ext]/[name].[hash].[ext]', // 拆分js到模块文件夹 // chunkFileNames: (chunkInfo) => { //     const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []; //     const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'; //     return `js/${fileName}/[name].[hash].js`; // },
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
      // 构建产物预压缩：gzip + brotli，部署时由静态服务器直接返回，省去运行时压缩开销
      compression({ algorithm: 'gzip', threshold: 1024 }),
      compression({ algorithm: 'brotliCompress', threshold: 1024 }),
      // 体积可视化：仅 ANALYZE=true pnpm build 时生成 dist/stats.html
      process.env.ANALYZE === 'true' &&
        visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true }),
    ].filter(Boolean),
  });
};
