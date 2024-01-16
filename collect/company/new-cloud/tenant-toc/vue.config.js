const { resolve } = require('path');
const webpack = require('webpack');
const webpackConfig = require('./src/config/package.ts');
const proxyConfig = require('./src/core/proxy/index.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HappyPack = require('happypack');

const Components = require('unplugin-vue-components/webpack');
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers');

module.exports = {
  productionSourceMap: !webpackConfig.IS_PRODUCTION,
  publicPath: webpackConfig.PUBLIC_PATH,
  outputDir: 'dist/tenant-toc',
  devServer: {
    port: webpackConfig.PORT,
    proxy: proxyConfig.proxy,
  },
  // chainWebpack: (config) => {
  //   // 配置包分析器
  //   config.plugin('webpack-bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
  // },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.less$/,
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
          },
        },
        {
          test: /\.m?js$/,
          include: [resolve(__dirname, 'node_modules/@tiansu')],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    // 代码分割
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        cacheGroups: {
          vue: {
            name: 'chunk-vue',
            test: /[\\/]node_modules[\\/]vue[\\/]/,
            chunks: 'initial',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          vuex: {
            name: 'chunk-vuex',
            test: /[\\/]node_modules[\\/]vuex[\\/]/,
            chunks: 'initial',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'element-plus': {
            name: 'chunk-element-plus',
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            chunks: 'initial',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'ant-design-vue': {
            name: 'chunk-ant-design-vue',
            test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
            chunks: 'initial',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'vxe-table': {
            name: 'chunk-vxe-table',
            test: /[\\/]node_modules[\\/]vxe-table[\\/]/,
            chunks: 'initial',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
          '@vue': {
            name: 'chunk-vue',
            test: /[\\/]node_modules[\\/]@vue[\\/]/,
            chunks: 'initial',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          '@antv': {
            name: 'chunk-antv',
            test: /[\\/]node_modules[\\/]\@antv[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          echarts: {
            name: 'chunk-echarts',
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          'date-fns': {
            name: 'chunk-date-fns',
            test: /[\\/]node_modules[\\/]date-fns/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          dayjs: {
            name: 'chunk-dayjs',
            test: /[\\/]node_modules[\\/]dayjs/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          lodash: {
            name: 'chunk-lodash',
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'vue3-preview': {
            name: 'chunk-vue3-preview',
            test: /[\\/]node_modules[\\/]vue3-preview[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'web-core': {
            name: 'chunk-web-core',
            test: /[\\/]node_modules[\\/]web-core[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'crypto-js': {
            name: 'chunk-crypto-js',
            test: /[\\/]node_modules[\\/]crypto-js[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'asmcrypto.js': {
            name: 'chunk-asmcrypto.js',
            test: /[\\/]node_modules[\\/]asmcrypto.js[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'element-resize-detector': {
            name: 'chunk-element-resize-detector',
            test: /[\\/]node_modules[\\/]element-resize-detector[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          vuedraggable: {
            name: 'chunk-vuedraggable',
            test: /[\\/]node_modules[\\/]vuedraggable[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          '@tiansu/ts-web-package': {
            name: 'chunk-tiansu-ts-web-package',
            test: /[\\/]node_modules[\\/]\@tiansu[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            priority: 2,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              drop_debugger: true,
              drop_console: true,
              pure_funcs: ['console.log'],
            },
          },
          sourceMap: false, // config.build.productionSourceMap
          cache: true, // 启用缓存
          parallel: true, // 并行任务构建
        }),
      ],
    },
    plugins: [
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new HappyPack({
        // 这个id:js就代表这是打包js的
        id: 'css', //
        use: ['less-loader', 'css-loader'],
      }),
      new HappyPack({
        // 这个id:js就代表这是打包js的
        id: 'js', //
        use: [
          {
            //use是一个数组，这里写原先在rules的use里的loader配置
            loader: 'babel-loader',
            options: {
              presets: ['@babel/presets-env', '@babel/presets-react'],
            },
          },
        ],
      }),
    ],
  },
};
