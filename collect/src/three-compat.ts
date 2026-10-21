/**
 * three.js 0.173 颜色管线兼容开关。
 *
 * ⚠️ 必须在任何 THREE.Color 实例被创建之前执行，所以做成独立模块、
 *   由 main.ts 首行导入。ESM 按 import 顺序求值，页面模块都是路由懒加载，
 *   会排在它之后，因此模块顶层的 `new THREE.Color(...)` 常量也能被覆盖到。
 *
 * 背景：three ≤0.147 时 ColorManagement 默认关闭，Color 存的就是 sRGB 数值，
 * 叠加当时默认的线性输出，整条链相当于「跳过 gamma 解码」，画面看起来比物理
 * 正确的结果更亮。0.173 默认开启后走正确流程：颜色解码成线性 → 线性空间计算
 * → 输出再编码回 sRGB。流程正确，但现有配色会整体暗一截，地图底色与界线的
 * 对比关系全变。
 *
 * 这里关掉它，让所有既有配色维持升级前的观感。配套动作：
 *   1. renderer.outputColorSpace 设回 LinearSRGBColorSpace
 *      （见 useMapViewport.ts 与 useThreeScene.ts），否则输出仍会编码一次、整体发亮；
 *   2. 若将来想改用正确管线，删掉本文件的两行 + 上面那处 outputColorSpace 即可，
 *      届时自定义 ShaderMaterial 需要自行补 #include <colorspace_fragment>。
 */
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

export {};
