import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import {
  AntDesignVueResolver,
  ElementPlusResolver,
} from 'unplugin-vue-components/resolvers'
import requireTransform from 'vite-plugin-require-transform'

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    resolve: {
      // 别名
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
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
      port: 9528,
      host: '0.0.0.0',
      fs: {
        strict: false, // 解决Unrestricted file system access  vite对根目录的访问做了限制
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // 最小化拆分包
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString()
            }
          }, // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
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
      }),
      Components({
        resolvers: [AntDesignVueResolver(), ElementPlusResolver()],
      }),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
      }),
    ],
  })
}
