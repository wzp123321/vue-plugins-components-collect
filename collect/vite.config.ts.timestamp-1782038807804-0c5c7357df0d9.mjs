// vite.config.ts
import { defineConfig, loadEnv } from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/vite@5.4.14_@types+node@20.17.24_less@4.2.2/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import vue from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/@vitejs+plugin-vue@5.2.3_vi_83aedc47de5c03b4ad7cd14eae2e5de5/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-auto-import@0.18.6_1f6e86de976d23f65c4c12eecc330805/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/resolvers.js";
import requireTransform from "file:///E:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/vite-plugin-require-transform@1.0.21/node_modules/vite-plugin-require-transform/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\workspace\\private\\vue-plugins-components-collect\\collect";
var vite_config_default = ({ mode }) => {
  return defineConfig({
    // baseUrl: './',
    resolve: {
      // 别名
      alias: [
        {
          find: "@",
          replacement: resolve(__vite_injected_original_dirname, "src")
        },
        {
          find: "./cptable",
          replacement: "cptable"
        }
      ],
      // 支持的后缀
      extensions: [".js", ".ts", ".tsx", ".jsx", ".vue", ".less"]
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    // 开发选项
    server: {
      port: Number(loadEnv(mode, process.cwd()).VITE_DEV_SERVER_PORT),
      host: "0.0.0.0",
      fs: {
        strict: false
        // 解决Unrestricted file system access  vite对根目录的访问做了限制
      }
    },
    build: {
      sourcemap: false,
      outDir: "dist/pluginComponent-web",
      rollupOptions: {
        output: {
          // 最小化拆分包
          manualChunks: {
            "element-plus": ["element-plus"],
            axios: ["axios"],
            lodash: ["lodash"],
            vue: ["vue"],
            "vue3-slide-verify": ["vue3-slide-verify"],
            echarts: ["echarts"]
          },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: "[ext]/[name].[hash].[ext]"
          // 拆分js到模块文件夹 // chunkFileNames: (chunkInfo) => { //     const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []; //     const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'; //     return `js/${fileName}/[name].[hash].js`; // },
        }
      }
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ["vue", "vue-router", "pinia"],
        dts: "src/auto-imports.d.ts"
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: "src/components.d.ts"
      }),
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/
      })
    ]
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx3b3Jrc3BhY2VcXFxccHJpdmF0ZVxcXFx2dWUtcGx1Z2lucy1jb21wb25lbnRzLWNvbGxlY3RcXFxcY29sbGVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcd29ya3NwYWNlXFxcXHByaXZhdGVcXFxcdnVlLXBsdWdpbnMtY29tcG9uZW50cy1jb2xsZWN0XFxcXGNvbGxlY3RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L3dvcmtzcGFjZS9wcml2YXRlL3Z1ZS1wbHVnaW5zLWNvbXBvbmVudHMtY29sbGVjdC9jb2xsZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xyXG5cclxuaW1wb3J0IHJlcXVpcmVUcmFuc2Zvcm0gZnJvbSAndml0ZS1wbHVnaW4tcmVxdWlyZS10cmFuc2Zvcm0nO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICAvLyBiYXNlVXJsOiAnLi8nLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAvLyBcdTUyMkJcdTU0MERcclxuICAgICAgYWxpYXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQCcsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICcuL2NwdGFibGUnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdjcHRhYmxlJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICAvLyBcdTY1MkZcdTYzMDFcdTc2ODRcdTU0MEVcdTdGMDBcclxuICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLnRzJywgJy50c3gnLCAnLmpzeCcsICcudnVlJywgJy5sZXNzJ10sXHJcbiAgICB9LFxyXG4gICAgY3NzOiB7XHJcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICBsZXNzOiB7XHJcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIFx1NUYwMFx1NTNEMVx1OTAwOVx1OTg3OVxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IE51bWJlcihsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpLlZJVEVfREVWX1NFUlZFUl9QT1JUKSxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgICBmczoge1xyXG4gICAgICAgIHN0cmljdDogZmFsc2UsIC8vIFx1ODlFM1x1NTFCM1VucmVzdHJpY3RlZCBmaWxlIHN5c3RlbSBhY2Nlc3MgIHZpdGVcdTVCRjlcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODRcdThCQkZcdTk1RUVcdTUwNUFcdTRFODZcdTk2NTBcdTUyMzZcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICBvdXREaXI6ICdkaXN0L3BsdWdpbkNvbXBvbmVudC13ZWInLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAvLyBcdTY3MDBcdTVDMEZcdTUzMTZcdTYyQzZcdTUyMDZcdTUzMDVcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAnZWxlbWVudC1wbHVzJzogWydlbGVtZW50LXBsdXMnXSxcclxuICAgICAgICAgICAgYXhpb3M6IFsnYXhpb3MnXSxcclxuICAgICAgICAgICAgbG9kYXNoOiBbJ2xvZGFzaCddLFxyXG4gICAgICAgICAgICB2dWU6IFsndnVlJ10sXHJcbiAgICAgICAgICAgICd2dWUzLXNsaWRlLXZlcmlmeSc6IFsndnVlMy1zbGlkZS12ZXJpZnknXSxcclxuICAgICAgICAgICAgZWNoYXJ0czogWydlY2hhcnRzJ10sXHJcbiAgICAgICAgICB9LCAvLyBcdTc1MjhcdTRFOEVcdTRFQ0VcdTUxNjVcdTUzRTNcdTcwQjlcdTUyMUJcdTVFRkFcdTc2ODRcdTU3NTdcdTc2ODRcdTYyNTNcdTUzMDVcdThGOTNcdTUxRkFcdTY4M0NcdTVGMEZbbmFtZV1cdTg4NjhcdTc5M0FcdTY1ODdcdTRFRjZcdTU0MEQsW2hhc2hdXHU4ODY4XHU3OTNBXHU4QkU1XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5aGFzaFx1NTAzQ1xyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdqcy9bbmFtZV0uW2hhc2hdLmpzJywgLy8gXHU3NTI4XHU0RThFXHU1NDdEXHU1NDBEXHU0RUUzXHU3ODAxXHU2MkM2XHU1MjA2XHU2NUY2XHU1MjFCXHU1RUZBXHU3Njg0XHU1MTcxXHU0RUFCXHU1NzU3XHU3Njg0XHU4RjkzXHU1MUZBXHU1NDdEXHU1NDBEXHJcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2pzL1tuYW1lXS5baGFzaF0uanMnLCAvLyBcdTc1MjhcdTRFOEVcdThGOTNcdTUxRkFcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTc2ODRcdTU0N0RcdTU0MERcdUZGMENbZXh0XVx1ODg2OFx1NzkzQVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFxyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdbZXh0XS9bbmFtZV0uW2hhc2hdLltleHRdJywgLy8gXHU2MkM2XHU1MjA2anNcdTUyMzBcdTZBMjFcdTU3NTdcdTY1ODdcdTRFRjZcdTU5MzkgLy8gY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHsgLy8gICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkLnNwbGl0KCcvJykgOiBbXTsgLy8gICAgIGNvbnN0IGZpbGVOYW1lID0gZmFjYWRlTW9kdWxlSWRbZmFjYWRlTW9kdWxlSWQubGVuZ3RoIC0gMl0gfHwgJ1tuYW1lXSc7IC8vICAgICByZXR1cm4gYGpzLyR7ZmlsZU5hbWV9L1tuYW1lXS5baGFzaF0uanNgOyAvLyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICB2dWUoKSxcclxuICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXHJcbiAgICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgfSksXHJcbiAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXHJcbiAgICAgIH0pLFxyXG4gICAgICByZXF1aXJlVHJhbnNmb3JtKHtcclxuICAgICAgICBmaWxlUmVnZXg6IC8udHMkfC50c3gkfC52dWUkLyxcclxuICAgICAgfSksXHJcbiAgICBdLFxyXG4gIH0pO1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZXLFNBQVMsY0FBYyxlQUFlO0FBQ25aLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFFcEMsT0FBTyxzQkFBc0I7QUFQN0IsSUFBTSxtQ0FBbUM7QUFVekMsSUFBTyxzQkFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQzNCLFNBQU8sYUFBYTtBQUFBO0FBQUEsSUFFbEIsU0FBUztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxRQUFRLGtDQUFXLEtBQUs7QUFBQSxRQUN2QztBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQSxZQUFZLENBQUMsT0FBTyxPQUFPLFFBQVEsUUFBUSxRQUFRLE9BQU87QUFBQSxJQUM1RDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osbUJBQW1CO0FBQUEsUUFDckI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxRQUFRO0FBQUEsTUFDTixNQUFNLE9BQU8sUUFBUSxNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUUsb0JBQW9CO0FBQUEsTUFDOUQsTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQTtBQUFBLFVBRU4sY0FBYztBQUFBLFlBQ1osZ0JBQWdCLENBQUMsY0FBYztBQUFBLFlBQy9CLE9BQU8sQ0FBQyxPQUFPO0FBQUEsWUFDZixRQUFRLENBQUMsUUFBUTtBQUFBLFlBQ2pCLEtBQUssQ0FBQyxLQUFLO0FBQUEsWUFDWCxxQkFBcUIsQ0FBQyxtQkFBbUI7QUFBQSxZQUN6QyxTQUFTLENBQUMsU0FBUztBQUFBLFVBQ3JCO0FBQUE7QUFBQSxVQUNBLGdCQUFnQjtBQUFBO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLElBQUk7QUFBQSxNQUNKLFdBQVc7QUFBQSxRQUNULFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztBQUFBLFFBQ2pDLFNBQVMsQ0FBQyxPQUFPLGNBQWMsT0FBTztBQUFBLFFBQ3RDLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxNQUNELFdBQVc7QUFBQSxRQUNULFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztBQUFBLFFBQ2pDLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxNQUNELGlCQUFpQjtBQUFBLFFBQ2YsV0FBVztBQUFBLE1BQ2IsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFtdCn0K
