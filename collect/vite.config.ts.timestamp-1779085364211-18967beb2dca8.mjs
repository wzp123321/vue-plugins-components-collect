// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/vite@5.4.14_@types+node@20.17.24_less@4.2.2/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import vue from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/@vitejs+plugin-vue@5.2.3_vi_83aedc47de5c03b4ad7cd14eae2e5de5/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-auto-import@0.18.6_1f6e86de976d23f65c4c12eecc330805/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/unplugin-vue-components@0.2_31fec013dc3fd0e34e6414da20c439b2/node_modules/unplugin-vue-components/dist/resolvers.js";
import requireTransform from "file:///D:/workspace/private/vue-plugins-components-collect/collect/node_modules/.pnpm/vite-plugin-require-transform@1.0.21/node_modules/vite-plugin-require-transform/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\workspace\\private\\vue-plugins-components-collect\\collect";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxccHJpdmF0ZVxcXFx2dWUtcGx1Z2lucy1jb21wb25lbnRzLWNvbGxlY3RcXFxcY29sbGVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcd29ya3NwYWNlXFxcXHByaXZhdGVcXFxcdnVlLXBsdWdpbnMtY29tcG9uZW50cy1jb2xsZWN0XFxcXGNvbGxlY3RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3dvcmtzcGFjZS9wcml2YXRlL3Z1ZS1wbHVnaW5zLWNvbXBvbmVudHMtY29sbGVjdC9jb2xsZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnO1xyXG5cclxuaW1wb3J0IHJlcXVpcmVUcmFuc2Zvcm0gZnJvbSAndml0ZS1wbHVnaW4tcmVxdWlyZS10cmFuc2Zvcm0nO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICAvLyBiYXNlVXJsOiAnLi8nLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAvLyBcdTUyMkJcdTU0MERcclxuICAgICAgYWxpYXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiAnQCcsXHJcbiAgICAgICAgICByZXBsYWNlbWVudDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpbmQ6ICcuL2NwdGFibGUnLFxyXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICdjcHRhYmxlJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICAvLyBcdTY1MkZcdTYzMDFcdTc2ODRcdTU0MEVcdTdGMDBcclxuICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLnRzJywgJy50c3gnLCAnLmpzeCcsICcudnVlJywgJy5sZXNzJ10sXHJcbiAgICB9LFxyXG4gICAgY3NzOiB7XHJcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICBsZXNzOiB7XHJcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIFx1NUYwMFx1NTNEMVx1OTAwOVx1OTg3OVxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IE51bWJlcihsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpLlZJVEVfREVWX1NFUlZFUl9QT1JUKSxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgICBmczoge1xyXG4gICAgICAgIHN0cmljdDogZmFsc2UsIC8vIFx1ODlFM1x1NTFCM1VucmVzdHJpY3RlZCBmaWxlIHN5c3RlbSBhY2Nlc3MgIHZpdGVcdTVCRjlcdTY4MzlcdTc2RUVcdTVGNTVcdTc2ODRcdThCQkZcdTk1RUVcdTUwNUFcdTRFODZcdTk2NTBcdTUyMzZcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICBvdXREaXI6ICdkaXN0L3BsdWdpbkNvbXBvbmVudC13ZWInLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAvLyBcdTY3MDBcdTVDMEZcdTUzMTZcdTYyQzZcdTUyMDZcdTUzMDVcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ2VsZW1lbnQtcGx1cyc6IFsnZWxlbWVudC1wbHVzJ10sXHJcbiAgICAgICAgICBheGlvczogWydheGlvcyddLFxyXG4gICAgICAgICAgbG9kYXNoOiBbJ2xvZGFzaCddLFxyXG4gICAgICAgICAgdnVlOiBbJ3Z1ZSddLFxyXG4gICAgICAgICAgJ3Z1ZTMtc2xpZGUtdmVyaWZ5JzogWyd2dWUzLXNsaWRlLXZlcmlmeSddLFxyXG4gICAgICAgICAgZWNoYXJ0czogWydlY2hhcnRzJ10sXHJcbiAgICAgICAgfSwgLy8gXHU3NTI4XHU0RThFXHU0RUNFXHU1MTY1XHU1M0UzXHU3MEI5XHU1MjFCXHU1RUZBXHU3Njg0XHU1NzU3XHU3Njg0XHU2MjUzXHU1MzA1XHU4RjkzXHU1MUZBXHU2ODNDXHU1RjBGW25hbWVdXHU4ODY4XHU3OTNBXHU2NTg3XHU0RUY2XHU1NDBELFtoYXNoXVx1ODg2OFx1NzkzQVx1OEJFNVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOWhhc2hcdTUwM0NcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnanMvW25hbWVdLltoYXNoXS5qcycsIC8vIFx1NzUyOFx1NEU4RVx1NTQ3RFx1NTQwRFx1NEVFM1x1NzgwMVx1NjJDNlx1NTIwNlx1NjVGNlx1NTIxQlx1NUVGQVx1NzY4NFx1NTE3MVx1NEVBQlx1NTc1N1x1NzY4NFx1OEY5M1x1NTFGQVx1NTQ3RFx1NTQwRFxyXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdqcy9bbmFtZV0uW2hhc2hdLmpzJywgLy8gXHU3NTI4XHU0RThFXHU4RjkzXHU1MUZBXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3Njg0XHU1NDdEXHU1NDBEXHVGRjBDW2V4dF1cdTg4NjhcdTc5M0FcdTY1ODdcdTRFRjZcdTYyNjlcdTVDNTVcdTU0MERcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnW2V4dF0vW25hbWVdLltoYXNoXS5bZXh0XScsIC8vIFx1NjJDNlx1NTIwNmpzXHU1MjMwXHU2QTIxXHU1NzU3XHU2NTg3XHU0RUY2XHU1OTM5IC8vIGNodW5rRmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7IC8vICAgICBjb25zdCBmYWNhZGVNb2R1bGVJZCA9IGNodW5rSW5mby5mYWNhZGVNb2R1bGVJZCA/IGNodW5rSW5mby5mYWNhZGVNb2R1bGVJZC5zcGxpdCgnLycpIDogW107IC8vICAgICBjb25zdCBmaWxlTmFtZSA9IGZhY2FkZU1vZHVsZUlkW2ZhY2FkZU1vZHVsZUlkLmxlbmd0aCAtIDJdIHx8ICdbbmFtZV0nOyAvLyAgICAgcmV0dXJuIGBqcy8ke2ZpbGVOYW1lfS9bbmFtZV0uW2hhc2hdLmpzYDsgLy8gfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgdnVlKCksXHJcbiAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgaW1wb3J0czogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxyXG4gICAgICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXHJcbiAgICAgIH0pLFxyXG4gICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxyXG4gICAgICB9KSxcclxuICAgICAgcmVxdWlyZVRyYW5zZm9ybSh7XHJcbiAgICAgICAgZmlsZVJlZ2V4OiAvLnRzJHwudHN4JHwudnVlJC8sXHJcbiAgICAgIH0pLFxyXG4gICAgXSxcclxuICB9KTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VyxTQUFTLGNBQWMsZUFBZTtBQUNuWixTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBRXBDLE9BQU8sc0JBQXNCO0FBUDdCLElBQU0sbUNBQW1DO0FBVXpDLElBQU8sc0JBQVEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUMzQixTQUFPLGFBQWE7QUFBQTtBQUFBLElBRWxCLFNBQVM7QUFBQTtBQUFBLE1BRVAsT0FBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsUUFBUSxrQ0FBVyxLQUFLO0FBQUEsUUFDdkM7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWSxDQUFDLE9BQU8sT0FBTyxRQUFRLFFBQVEsUUFBUSxPQUFPO0FBQUEsSUFDNUQ7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTSxPQUFPLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFLG9CQUFvQjtBQUFBLE1BQzlELE1BQU07QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUE7QUFBQSxVQUVOLGNBQWM7QUFBQSxZQUNkLGdCQUFnQixDQUFDLGNBQWM7QUFBQSxZQUMvQixPQUFPLENBQUMsT0FBTztBQUFBLFlBQ2YsUUFBUSxDQUFDLFFBQVE7QUFBQSxZQUNqQixLQUFLLENBQUMsS0FBSztBQUFBLFlBQ1gscUJBQXFCLENBQUMsbUJBQW1CO0FBQUEsWUFDekMsU0FBUyxDQUFDLFNBQVM7QUFBQSxVQUNyQjtBQUFBO0FBQUEsVUFDRSxnQkFBZ0I7QUFBQTtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsTUFDSixXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxRQUNqQyxTQUFTLENBQUMsT0FBTyxjQUFjLE9BQU87QUFBQSxRQUN0QyxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxRQUNqQyxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUEsTUFDRCxpQkFBaUI7QUFBQSxRQUNmLFdBQVc7QUFBQSxNQUNiLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbXQp9Cg==
