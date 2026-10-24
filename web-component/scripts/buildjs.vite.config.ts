import path from 'path';
import fsExtra from 'fs-extra';
import fs from 'fs';
import { defineConfig, build } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';
import requireTransform from 'vite-plugin-require-transform';
import commonjs from '@rollup/plugin-commonjs';

const entryDir = path.resolve(__dirname, '../packages/components/lib');
const outputDir = path.resolve(__dirname, '../packages/dist/lib');

const baseConfig = defineConfig({
  publicDir: false,
  plugins: [
    vue(),
    vueJsx(),
    dts({
      entryRoot: entryDir,
      outDir: outputDir,
      // rollupTypes: true,
      // cleanVueFileName: true
      // declarationOnly: true
      //指定使用的tsconfig.json为我们整个项目根目录下,如果不配置,你也可以在components下新建tsconfig.json
      // tsconfigPath: "../tsconfig.json",
    }),
    requireTransform({
      fileRegex: /.ts$|.tsx$|.vue$/,
    }),
    commonjs(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../packages'),
    },
  },
  // chunk 大小警告的限制
  // chunkSizeWarningLimit: 100,
  // minify: true
});

const rollupOptions = {
  external: [
    'vue',
    'js-base64',
    'element-plus',
    'crypto-js',
    'big-integer',
    'axios',
    'asmcrypto.js',
    'handlebars',
    'fs-extra',
    '@element-plus/icons-vue',
    '@zpackage/web-package',
    'element-plus',
    'vue-router',
    '@arco-iconbox/vue-te',
    '@arco-iconbox/vue-te-side',
    '@arco-iconbox/vue-te/esm',
    'vue3-print-nb',
    'moment',
    '@antv/x6',
    '@antv/x6-plugin-snapline',
    '@antv/x6-vue-shape',
    '@zpackage/tools',
    'echarts',
    'big.js',
  ],
  output: {
    globals: {
      vue: 'Vue',
    },
    exports: 'named',
  },
};

// 全量构建
const buildAll = async () => {
  await build(
    defineConfig({
      ...baseConfig,
      build: {
        target: 'ES2018',
        rollupOptions,
        lib: {
          entry: path.resolve(entryDir, 'index.ts'),
          name: 'index',
          fileName: 'index',
          formats: ['es', 'cjs'],
        },
        outDir: outputDir,
      },
    }),
  );
};

const buildSingle = async (name) => {
  await build(
    defineConfig({
      ...baseConfig,
      build: {
        target: 'ES2018',
        rollupOptions,
        lib: {
          entry: path.resolve(entryDir, name),
          name: 'index',
          fileName: 'index',
          formats: ['es', 'cjs'],
        },
        outDir: path.resolve(outputDir, name),
      },
      // plugins: [
      //   vue(),
      //   dts({
      //     entryRoot: path.resolve(entryDir, name),
      //     outputDir: path.resolve(outputDir, name),
      //     //指定使用的tsconfig.json为我们整个项目根目录下,如果不配置,你也可以在components下新建tsconfig.json
      //     tsConfigFilePath: "../tsconfig.json",
      //   })
      // ]
    }),
  );
};

// 生成组件的 package.json 文件
const createPackageJson = (name) => {
  const fileStr = `{
  "name": "${name}",
  "version": "0.0.0",
  "main": "index.js",
  "module": "index.mjs",
  "style": "style.css"
}`;

  fsExtra.outputFile(
    path.resolve(outputDir, `${name}/package.json`),
    fileStr,
    'utf-8',
  );
};

// const declareFileStr = `
// import { App } from 'vue';
// declare const _default: {
//   install(app: App): void
// }
// export default _default`;

// const createDeclare = (name) => {
//   fsExtra.outputFile(
//     path.resolve(outputDir, `${name}/index.d.ts`),
//     declareFileStr,
//     'utf-8'
//   )
// }

const buildLib = async () => {
  await buildAll();
  // 获取组件名称组成的数组
  const components = fs.readdirSync(entryDir).filter((name) => {
    const componentDir = path.resolve(entryDir, name);
    const isDir = fs.lstatSync(componentDir).isDirectory();
    return isDir && fs.readdirSync(componentDir).includes('index.ts');
  });

  // fsExtra.outputFile(
  //   path.resolve(outputDir, `index.d.ts`),
  //   declareFileStr,
  //   'utf-8'
  // )

  // 循环一个一个组件构建
  for (const name of components) {
    // 构建单组件
    await buildSingle(name);

    // 生成组件的 package.json 文件
    createPackageJson(name);

    // 生成组件的 index.d.ts
    // createDeclare(name)
  }

  const outputPath = path.resolve(outputDir, '../styles/index.css');
  // 读取并合并CSS文件内容
  fs.readFile(path.resolve(outputDir, 'style.css'), 'utf8', (err, data1) => {
    if (err) {
      console.error('读取第一个文件时出错:', err);
      return;
    }

    fs.readFile(outputPath, 'utf8', (err, data2) => {
      if (err) {
        console.error('读取第二个文件时出错:', err);
        return;
      }

      // 合并内容
      const combinedData = data1 + '\n' + data2;

      // 写入合并后的内容到新的文件
      fs.writeFile(outputPath, combinedData, 'utf8', (err) => {
        if (err) {
          console.error('写入文件时出错:', err);
        } else {
          console.log('CSS文件合并成功，输出到:', outputPath);
        }
      });
    });
  });
};

buildLib();
