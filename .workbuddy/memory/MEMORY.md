# 工作区长期记忆

## 项目背景
用户是一名全栈开发者，该工作区是个人前端技术收集与实践平台，包含 5 个独立子项目：
- collect（主项目，Vue3+Vite+Element Plus）
- mobile-component（UniApp 组件库 Monorepo，支持 uniapp/uniapp-x 双端）
- ai-demo（AI 编码规范与 Skills 配置）
- dependencies-guard（npm 依赖白名单守卫工具）
- terminal（简洁路由演示项目）

## 技术栈
- 主项目：Vue3 + TypeScript 5.3 + Vite 5 + Element Plus + Pinia + Vue Router 5
- 移动端：UniApp + UniApp X（vue 文件 + uvue 文件双端）
- 3D：Three.js 0.147 + Babylon.js 5.57
- 图表：ECharts 5.6 + ANTv G6 4.8
- 工具：VueUse 9 + lodash + RxJS 7.8 + date-fns 4 + dayjs
- 文件：exceljs + file-saver + spark-md5 + html2canvas + @vue-office
- 编辑器：CodeMirror 6

## 已收集技术要点（2026-05-18 梳理）
- ECharts 图表：15+ 种类型（折线/面积/柱状/饼/地图/水球/玫瑰/排名/实时/分段/暗主题等）
- 3D：Three.js 3个场景 + Babylon.js 4个示例
- 动画：8种 CSS+JS 动画
- CSS：Flex/Grid/伪元素/z-index/毛玻璃/换行/语义化等
- 插件：VueUse 12个API演示、大文件分片上传、虚拟列表、CodeMirror6代码编辑器
- 自定义指令：5个（防抖/防重复点击/输入过滤/文本过滤/拖拽）
- Hooks：19个
- 工具函数：日期/数字/存储/GCM加密/UUID/Excel/全屏/DOM克隆
- 移动端：45+基础组件 + Token主题系统（亮/暗）

## 待补充方向（优先级排序）
1. ✅ 富文本编辑器（WangEditor/TipTap）—— form-enhance 模块已添加 contenteditable 实现
2. ✅ Axios 请求层封装 —— network 模块已添加完整示例
3. ✅ Canvas 绘图进阶 —— canvas-advance 模块已完成
4. ✅ WebSocket 实时通信 —— network 模块已添加
5. ✅ 图片裁剪上传（vue-cropper）—— form-enhance 模块已添加 Canvas 版裁剪
6. ✅ Pinia 持久化 / 状态管理进阶 —— store-advance 模块已完成
7. ✅ 甘特图 / D3.js 数据可视化 —— canvas-advance 模块已添加 ECharts 甘特图
8. ✅ Vue3 进阶特性演示（defineModel/Teleport/Suspense）—— vue3-advanced 模块已完成

## 用户偏好
- 使用简体中文沟通，注重实用落地
- 技术栈以 Vue3 为核心，兼顾 UniApp 移动端
- 个人收集库风格：分类清晰、有路由演示页
