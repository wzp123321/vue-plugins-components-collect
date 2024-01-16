const { resolve } = require('path');

// 代理配置文件
const proxyConfig = require('./src/services/proxy/index');
const webpackConfig = require('./src/config/package.ts');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const HappyPack = require('happypack');

module.exports = {
  // 生产环境下是否生成map文件
  productionSourceMap: !webpackConfig.IS_PRODUCTION,
  publicPath: webpackConfig.PUBLIC_PATH,
  outputDir: 'dist/ems-web',
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
    // 使用webpack本身的配置添加缓存。
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
    },
    resolve: {
      // 别名
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    optimization: {
      // 代码分割
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          vue: {
            name: 'chunk-vue',
            test: /[\\/]node_modules[\\/]vue[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          vuex: {
            name: 'chunk-vuex',
            test: /[\\/]node_modules[\\/]vuex[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'vue-router': {
            name: 'chunk-vue-router',
            test: /[\\/]node_modules[\\/]vue-router[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'element-plus': {
            name: 'chunk-element-plus',
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          echarts: {
            name: 'chunk-echarts',
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            chunks: 'all',
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
          'vue-grid-layout': {
            name: 'chunk-vue-grid-layout',
            test: /[\\/]node_modules[\\/]vue-grid-layout[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'date-fns': {
            name: 'chunk-date-fns',
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          dayjs: {
            name: 'chunk-dayjs',
            test: /[\\/]node_modules[\\/]dayjs[\\/]/,
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
          lodash: {
            name: 'chunk-lodash',
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          rxjs: {
            name: 'chunk-rxjs',
            test: /[\\/]node_modules[\\/]rxjs[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          axios: {
            name: 'chunk-axios',
            test: /[\\/]node_modules[\\/]axios[\\/]/,
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
          '@tiansu/ts-web-package': {
            name: 'chunk-tiansu-ts-web-package',
            test: /[\\/]node_modules[\\/]\@tiansu[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          'vue-virtual-scroller': {
            name: 'chunk-vue-virtual-scroller',
            test: /[\\/]node_modules[\\/]vue-virtual-scroller[\\/]/,
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
      // minimizer: [
      // new UglifyJsPlugin({
      //   uglifyOptions: {
      //     compress: {
      //       drop_debugger: true,
      //       drop_console: true,
      //       pure_funcs: ['console.log'],
      //     },
      //   },
      //   sourceMap: false, // config.build.productionSourceMap
      //   cache: true, // 启用缓存
      //   parallel: true, // 并行任务构建
      // }),
      // ],
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
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
  devServer: {
    port: webpackConfig.PORT,
    proxy: proxyConfig.proxy,
  },
};
