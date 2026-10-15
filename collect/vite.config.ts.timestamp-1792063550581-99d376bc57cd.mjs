// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/vite@5.4.14_@types+node@20.17.24_less@4.2.2/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import vue from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/@vitejs+plugin-vue@5.2.3_vi_83aedc47de5c03b4ad7cd14eae2e5de5/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-auto-import@0.18.6_1f6e86de976d23f65c4c12eecc330805/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/resolvers.js";
import requireTransform from "file:///D:/workspace/private/collect/vue-plugins-components-collect/collect/node_modules/.pnpm/vite-plugin-require-transform@1.0.21/node_modules/vite-plugin-require-transform/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\workspace\\private\\collect\\vue-plugins-components-collect\\collect";
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
        },
        // @vue-office/* 包 postinstall 不会生成 lib/index.js，强制指向 vue3 构建产物
        // CSS 路径放前面优先匹配，避免被下面 js 别名吞掉后缀
        {
          find: "@vue-office/docx/lib/index.css",
          replacement: resolve(__vite_injected_original_dirname, "node_modules/@vue-office/docx/lib/v3/index.css")
        },
        {
          find: "@vue-office/docx",
          replacement: resolve(__vite_injected_original_dirname, "node_modules/@vue-office/docx/lib/v3/index.js")
        },
        {
          find: "@vue-office/pdf",
          replacement: resolve(__vite_injected_original_dirname, "node_modules/@vue-office/pdf/lib/v3/index.js")
        },
        {
          find: "@vue-office/excel",
          replacement: resolve(__vite_injected_original_dirname, "node_modules/@vue-office/excel/lib/v3/index.js")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxccHJpdmF0ZVxcXFxjb2xsZWN0XFxcXHZ1ZS1wbHVnaW5zLWNvbXBvbmVudHMtY29sbGVjdFxcXFxjb2xsZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxccHJpdmF0ZVxcXFxjb2xsZWN0XFxcXHZ1ZS1wbHVnaW5zLWNvbXBvbmVudHMtY29sbGVjdFxcXFxjb2xsZWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3Jrc3BhY2UvcHJpdmF0ZS9jb2xsZWN0L3Z1ZS1wbHVnaW5zLWNvbXBvbmVudHMtY29sbGVjdC9jb2xsZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xyXG5cclxuaW1wb3J0IHJlcXVpcmVUcmFuc2Zvcm0gZnJvbSAndml0ZS1wbHVnaW4tcmVxdWlyZS10cmFuc2Zvcm0nO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICAvLyBiYXNlVXJsOiAnLi8nLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAvLyBcdTUyMkJcdTU0MERcclxuICAgICAgYWxpYXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQCcsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICcuL2NwdGFibGUnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdjcHRhYmxlJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIEB2dWUtb2ZmaWNlLyogXHU1MzA1IHBvc3RpbnN0YWxsIFx1NEUwRFx1NEYxQVx1NzUxRlx1NjIxMCBsaWIvaW5kZXguanNcdUZGMENcdTVGM0FcdTUyMzZcdTYzMDdcdTU0MTEgdnVlMyBcdTY3ODRcdTVFRkFcdTRFQTdcdTcyNjlcclxuICAgICAgICAvLyBDU1MgXHU4REVGXHU1Rjg0XHU2NTNFXHU1MjREXHU5NzYyXHU0RjE4XHU1MTQ4XHU1MzM5XHU5MTREXHVGRjBDXHU5MDdGXHU1MTREXHU4OEFCXHU0RTBCXHU5NzYyIGpzIFx1NTIyQlx1NTQwRFx1NTQxRVx1NjM4OVx1NTQwRVx1N0YwMFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICdAdnVlLW9mZmljZS9kb2N4L2xpYi9pbmRleC5jc3MnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL0B2dWUtb2ZmaWNlL2RvY3gvbGliL3YzL2luZGV4LmNzcycpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmluZDogJ0B2dWUtb2ZmaWNlL2RvY3gnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL0B2dWUtb2ZmaWNlL2RvY3gvbGliL3YzL2luZGV4LmpzJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQHZ1ZS1vZmZpY2UvcGRmJyxcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiByZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9AdnVlLW9mZmljZS9wZGYvbGliL3YzL2luZGV4LmpzJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQHZ1ZS1vZmZpY2UvZXhjZWwnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL0B2dWUtb2ZmaWNlL2V4Y2VsL2xpYi92My9pbmRleC5qcycpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIC8vIFx1NjUyRlx1NjMwMVx1NzY4NFx1NTQwRVx1N0YwMFxyXG4gICAgICBleHRlbnNpb25zOiBbJy5qcycsICcudHMnLCAnLnRzeCcsICcuanN4JywgJy52dWUnLCAnLmxlc3MnXSxcclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIGxlc3M6IHtcclxuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gXHU1RjAwXHU1M0QxXHU5MDA5XHU5ODc5XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogTnVtYmVyKGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSkuVklURV9ERVZfU0VSVkVSX1BPUlQpLFxyXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICAgIGZzOiB7XHJcbiAgICAgICAgc3RyaWN0OiBmYWxzZSwgLy8gXHU4OUUzXHU1MUIzVW5yZXN0cmljdGVkIGZpbGUgc3lzdGVtIGFjY2VzcyAgdml0ZVx1NUJGOVx1NjgzOVx1NzZFRVx1NUY1NVx1NzY4NFx1OEJCRlx1OTVFRVx1NTA1QVx1NEU4Nlx1OTY1MFx1NTIzNlxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgIG91dERpcjogJ2Rpc3QvcGx1Z2luQ29tcG9uZW50LXdlYicsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIC8vIFx1NjcwMFx1NUMwRlx1NTMxNlx1NjJDNlx1NTIwNlx1NTMwNVxyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICdlbGVtZW50LXBsdXMnOiBbJ2VsZW1lbnQtcGx1cyddLFxyXG4gICAgICAgICAgICBheGlvczogWydheGlvcyddLFxyXG4gICAgICAgICAgICB2dWU6IFsndnVlJ10sXHJcbiAgICAgICAgICAgICd2dWUzLXNsaWRlLXZlcmlmeSc6IFsndnVlMy1zbGlkZS12ZXJpZnknXSxcclxuICAgICAgICAgICAgZWNoYXJ0czogWydlY2hhcnRzJ10sXHJcbiAgICAgICAgICB9LCAvLyBcdTc1MjhcdTRFOEVcdTRFQ0VcdTUxNjVcdTUzRTNcdTcwQjlcdTUyMUJcdTVFRkFcdTc2ODRcdTU3NTdcdTc2ODRcdTYyNTNcdTUzMDVcdThGOTNcdTUxRkFcdTY4M0NcdTVGMEZbbmFtZV1cdTg4NjhcdTc5M0FcdTY1ODdcdTRFRjZcdTU0MEQsW2hhc2hdXHU4ODY4XHU3OTNBXHU4QkU1XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5aGFzaFx1NTAzQ1xyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdqcy9bbmFtZV0uW2hhc2hdLmpzJywgLy8gXHU3NTI4XHU0RThFXHU1NDdEXHU1NDBEXHU0RUUzXHU3ODAxXHU2MkM2XHU1MjA2XHU2NUY2XHU1MjFCXHU1RUZBXHU3Njg0XHU1MTcxXHU0RUFCXHU1NzU3XHU3Njg0XHU4RjkzXHU1MUZBXHU1NDdEXHU1NDBEXHJcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2pzL1tuYW1lXS5baGFzaF0uanMnLCAvLyBcdTc1MjhcdTRFOEVcdThGOTNcdTUxRkFcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTc2ODRcdTU0N0RcdTU0MERcdUZGMENbZXh0XVx1ODg2OFx1NzkzQVx1NjU4N1x1NEVGNlx1NjI2OVx1NUM1NVx1NTQwRFxyXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdbZXh0XS9bbmFtZV0uW2hhc2hdLltleHRdJywgLy8gXHU2MkM2XHU1MjA2anNcdTUyMzBcdTZBMjFcdTU3NTdcdTY1ODdcdTRFRjZcdTU5MzkgLy8gY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHsgLy8gICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkID8gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkLnNwbGl0KCcvJykgOiBbXTsgLy8gICAgIGNvbnN0IGZpbGVOYW1lID0gZmFjYWRlTW9kdWxlSWRbZmFjYWRlTW9kdWxlSWQubGVuZ3RoIC0gMl0gfHwgJ1tuYW1lXSc7IC8vICAgICByZXR1cm4gYGpzLyR7ZmlsZU5hbWV9L1tuYW1lXS5baGFzaF0uanNgOyAvLyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICB2dWUoKSxcclxuICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXHJcbiAgICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgfSksXHJcbiAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXHJcbiAgICAgIH0pLFxyXG4gICAgICByZXF1aXJlVHJhbnNmb3JtKHtcclxuICAgICAgICBmaWxlUmVnZXg6IC8udHMkfC50c3gkfC52dWUkLyxcclxuICAgICAgfSksXHJcbiAgICBdLFxyXG4gIH0pO1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVZLFNBQVMsY0FBYyxlQUFlO0FBQzdhLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFFcEMsT0FBTyxzQkFBc0I7QUFQN0IsSUFBTSxtQ0FBbUM7QUFVekMsSUFBTyxzQkFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQzNCLFNBQU8sYUFBYTtBQUFBO0FBQUEsSUFFbEIsU0FBUztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxRQUFRLGtDQUFXLEtBQUs7QUFBQSxRQUN2QztBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWE7QUFBQSxRQUNmO0FBQUE7QUFBQTtBQUFBLFFBR0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyxnREFBZ0Q7QUFBQSxRQUNsRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVywrQ0FBK0M7QUFBQSxRQUNqRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyw4Q0FBOEM7QUFBQSxRQUNoRjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyxnREFBZ0Q7QUFBQSxRQUNsRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWSxDQUFDLE9BQU8sT0FBTyxRQUFRLFFBQVEsUUFBUSxPQUFPO0FBQUEsSUFDNUQ7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTSxPQUFPLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFLG9CQUFvQjtBQUFBLE1BQzlELE1BQU07QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUE7QUFBQSxVQUVOLGNBQWM7QUFBQSxZQUNaLGdCQUFnQixDQUFDLGNBQWM7QUFBQSxZQUMvQixPQUFPLENBQUMsT0FBTztBQUFBLFlBQ2YsS0FBSyxDQUFDLEtBQUs7QUFBQSxZQUNYLHFCQUFxQixDQUFDLG1CQUFtQjtBQUFBLFlBQ3pDLFNBQVMsQ0FBQyxTQUFTO0FBQUEsVUFDckI7QUFBQTtBQUFBLFVBQ0EsZ0JBQWdCO0FBQUE7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsUUFDakMsU0FBUyxDQUFDLE9BQU8sY0FBYyxPQUFPO0FBQUEsUUFDdEMsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsUUFDakMsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLE1BQ0QsaUJBQWlCO0FBQUEsUUFDZixXQUFXO0FBQUEsTUFDYixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=
