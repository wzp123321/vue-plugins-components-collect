const { VueLoaderPlugin } = require('vue-loader')
const glob = require('glob')
const path = require('path')
const { resolve } = require('path')

// list格式如下： 
//{
//     card: './components/lib/card/index.js'
// }
const list = {}

async function makeList(dirPath, out) {
    const files = glob.sync(`${dirPath}/**/index.ts`)
    console.log('files: ', files);
    for (const file of files) {
        const componentName = file.split(/[/.]/)[3]
        out[componentName] = `./${file}`
    }
}

makeList('packages/components/lib', list)

console.log('打包的组件集合：', list);

module.exports = {
    entry: list,
    // development
    mode: 'development',
    resolve: {
        mainFiles: ["index", "index.ts"], // 注意，前面这个index必须要有，否则会报错
        alias: {
            '@assets': resolve('packages/components/assets'),
        }
    },
    output: {
        filename: '[name].umd.js', // card.umd.js 这样一个bundle文件
        path: path.resolve(__dirname, '../packages/dist'),
        library: 'TSUI',
        libraryTarget: 'umd',
        publicPath: "../dist/"
    },
    externals: {
        vue: {  //将vue依赖 "外部化"，不打包进组件库
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
          },
        //   '@tiansu/element-plus': '@tiansu/element-plus'
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                    }
                ]
            }, {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(process.cwd(), 'tsconfig.json'),
                            appendTsSuffixTo: [/\.vue$/],
                            /* 只做语言转换，而不做类型检查, 这里如果不设置成TRUE，就会HMR 报错 */
                            transpileOnly: true, 
                        },
                    }
                ],
            }, {
                test: /\.s(a|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto"
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                loader: 'url-loader',
                options: {
                    // 图片会大于8kb，会被base64处理  减少请求数量（减轻服务器压力） 图片体积会更大（文件请求数量慢）
                    limit: 8 * 1024,
                    name: '[hash:10].[ext]',  // hash值的前十位 [ext]表示取文件原来的扩展名
                    // outputPath: 'images',   // 输出到img
                    esModule: false
                },
                type: 'javascript/auto'
            },
            // { 
            //     // 命中字体包 
            //     test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, 
            //     // 只命中指定 目录下的文件，加快Webpack 搜索速度 
            //     // include: [paths.toolSrc], 
            //     // 排除 node_modules 目录下的文件 
            //     exclude: /(node_modules)/, 
            //     loader: 'file-loader', 
            //     // 新增options配置参数：关于file-loader的配置项 
            //     options: { 
            //         limit: 10000, 
            //         // 定义打包完成后最终导出的文件路径 
            //         outputPath: 'css/fonts/', 
            //         // 文件的最终名称
            //         name: '[name].[hash:7].[ext]' 
            //     }
            // }
        ]
    }
}