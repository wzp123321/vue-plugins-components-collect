// rollup 默认查找当前目录下的rollup.config
// 采用es 模块编写配置文件
// 引入插件
import ts from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";
import terser from "@rollup/plugin-terser";
// node esm 下没有 __dirname __filename 但是提供了 import.meta.url
import path from "path";
import { fileURLToPath } from "url";
import { babel } from "@rollup/plugin-babel";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
	external: [/node_modules/, "tslib"],
	input: path.resolve(__dirname, "../packages/components/index.ts"),
	output: [
		{
			file: path.resolve(__dirname, "../packages/dist/index.mjs"),
			format: "es",
			sourcemap: true,
		},
		{
			file: path.resolve(__dirname, "../packages/dist/index.js"),
			format: "cjs",
			sourcemap: true,
		},
	],

	plugins: [
		nodeResolve(),
		commonjs(),
		nodePolyfills(),
		ts({
			tsconfig: path.resolve(__dirname, "../tsconfig.json"),
			tslib: "tslib",
		}),
		terser({
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
			sourceMap: true,
		}),
		babel({ exclude: /node_modules/, babelHelpers: "bundled" }),
	],
};
