# 项目长期记忆 — vue-plugins-components-collect（collect 组件收集站）

## 工程结构与约定
- 应用根 `collect/`：Vue3 + Vite + TS + Element Plus + vue-router，样式 less scoped；组件统一 `el-*`（vite 自动按需导入）。
- 路由拆在 `src/router/modules/*.ts`，页面放 `src/pages/<类目>/<页面名>/<页面名>.vue`。
- 侧边栏**不从路由派生**：`src/views/layout/aside-box/constant.ts` 手工维护 `navGroups`（5 域 → 13 分区 → 81 条），搜索走 `src/utils/semantic-search.ts`（Ctrl K）。**新增页面必须同时改路由 + 导航**，提交前跑 `node scripts/check-nav-routes.mjs`（npm `check:nav`，已挂 pre-commit）。孤儿页面归档 `collect/_archive/pages/`（不参与构建）。
- `te-*`（@tiansu）组件**在用**：14 个目录，`pages/components/components/te-model.ts` 注册为演示，约 75 处引用。旧"禁用 te-*"约定已被代码推翻，口径待用户确认，**别凭旧记忆删**。
- **收录规则（方案 B）**：按场景建页、不为单技术堆 demo。「技术怎么用」→ 不建；「技术A × 技术B × 我的约束」→ 建场景页（注释写场景、文件头列技术组合、踩坑注落点）。权威文档在根 README「开发约定」。

## three.js 地图（0.173，硬约束）
- `three` 与 `@types/three` **必须同步升**（0.173 包内无 .d.ts、无 types 字段）。私有 Nexus 对 three 返 403，`collect/.npmrc` 已把 registry 指回官方源，`@tiansu` 仍走私有源。
- **颜色管线刻意保留旧行为**：`src/three-compat.ts` 关 `ColorManagement`；两个 renderer 都设 `outputColorSpace = LinearSRGBColorSpace`。别"顺手升级"成 sRGB——整套配色会集体变暗，需重新调色。
- **光照必须过 `legacyIntensity()`**（`pages/threejs/shared/lighting.ts`，×π）：r160 删了 `useLegacyLights`，不补偿暗 3.14 倍。
- **draw call**：`ExtrudeGeometry` 按 shape 分组且产出**非索引几何**，多 shape 合并后必须 `collapseExtrudeGroups()`（补索引再按 materialIndex 重排），否则组数 = shape×2，等于没合。边界线统一 `LineSegments2` + 单 geometry。
- `MapPerfPanel` 常显 FPS/calls/tris（`.map-search` 占了左边，面板在 `left:268px`）；`renderer.info.autoReset` 已关，每帧手动 reset 才统计得到两趟渲染。

## echarts 地图大屏
- `chart-map` + `chart-province` 已合并为 **`chart-dashboard`**：单实例按 `level` 切「全国（可点省份下钻）/ 省份（懒加载 geojson + TOP10 + 明细）」。数据 `assets/geojson/china.json`（35 要素，含 adcode+name）、`province/*.json`（33 省，`import.meta.glob` 懒加载）。路由 `/echarts-map`，`/echarts-province` redirect（nav 标 `searchOnly`）。`cm-bar/cm-gauge` 留作 KPI 面板。
- **统一入口 `src/config/echarts/setup`**：业务侧只从这里导 init/类型，不直连 `echarts` 主包（主包 `export =` 与 core 的 `EChartsType` 名义类型不互通）。wordcloud/liquidfill 内部 `require("echarts")` 会打进全量主包，按需对体积无收益。

## 本机环境坑
- **亿赛通透明加密**：本工程 `.md` 被加密。读用 `head -c N "$f"`；判密文 `tr -dc '\0' < "$f" | wc -c`（>0 即密文）；写用 Edit/Write 或 bash `>` 才产明文。
- **沙箱删除守卫（>50 文件）**杀 `pnpm dev` / `vite build`：① 别靠 `mv node_modules/.vite` 绕——触发全量重优化，optimizer 提交阶段 `rm deps_temp_*` 照样被拦（ready 后 ERR_CONNECTION_REFUSED）；缓存别动，已移开的移回。② 整包 `vite build` 在 bundle 阶段必被 SIGTERM，dev server 遇新依赖即被杀 → **本机产不出完整生产包**，正确性以 `ts-check` + transform 零报错为准，完整包由用户本机 `npm run build` 收口。
- **浏览器验证（headless + CDP）**：dev server 必须 `run_in_background` 且不接管道截断。Chrome `--headless=new --remote-debugging-port=9222 --disable-gpu --no-sandbox` + 同链内跑 CDP 脚本 + taskkill（常驻启动会被回收）。Node fetch 走代理连不上 127.0.0.1，CDP HTTP 端用内置 `http` 模块。**`captureScreenshot` 在 `--disable-gpu` 下丢文本**，验 DOM 用 `Runtime.evaluate`。
- **网络出口（2026-10-26 实测）**：沙箱代理 `127.0.0.1:51322` 对 GitHub 返 `CONNECT tunnel failed 502`（只放行白名单）；直连 `github.com:443` 全超时（试 6 个 IP）。→ **`git push` 本会话不可能成功**，只能本地提交；推送需用户恢复代理/VPN。`codeload.github.com` 直连可达。

## 全仓 lint 硬约定（2026-10-26 起长期有效）
- **风格**：`collect/src` 函数一律箭头函数；**不许用 eslint-disable 掩盖**，必须真修。现存 disable 只允许在 auto-imports.d.ts / components.d.ts / env.d.ts 三个生成物。
- **已清零**：eslint **0 error**（剩 410 warning，多为 no-explicit-any）、vue-tsc **0 error**、stylelint **0 error**。新代码保持 0 error 提交。
- **pre-commit 四项**：check-nav-routes → check-unresolved-components → lint-staged（eslint + stylelint）。
  - 本机坑：lint-staged 用 pidtree 调 `wmic.exe` 被安全策略拉黑 → 钩子恒定 exit 1（eslint/stylelint 本身都过）。只能 `--no-verify`，但**必须手动跑齐四项**。
  - `git commit` 会吞索引里**所有已暂存**文件（曾误吞 9MB stats.html）：分批前先 `git restore --staged .`，再按目录 `git add` 单组提交。
- **stylelint 版本锁**：`stylelint-config-recommended-vue` 必须 `^1.5.0`（v2 要 stylelint≥16 / postcss-html^2，与仓库 15.11 / 1.8 冲突）。vendor CSS 已加 ignoreFiles。
- **重排/改名类重构三类回归**：① 闭包内 `let x` 丢赋值收窄（TS18047）→ 局部 const 承接；② 删「未使用参数」要同步改调用方实参；③ `v-for` 的 index 只在 `<template :key>` 用会被判未读（TS6133）→ 换稳定字段做 key。

## 接缝本（现学必记，时间倒序）
定位：收集站收「世界上有什么」，这里收「和我的环境/数据/约束怎么接」。现学 >10 分钟，学会后 2 分钟内记一条，≤5 行，新条目在最上方。

### 2026-10-21 CDP 探针 × Vue 内部状态（三个 Silent-Fail）
- `Runtime.evaluate` 里 async IIFE 必须传 `awaitPromise:true`，否则拿回 Promise、`result.value` 恒 undefined。
- `instance.setupState` 是 proxyRefs，**读取即解包**（再 `.value` 恒 undefined）；判断绑定改用 `instance.proxy.$refs.xxx`。
- threejs 地图重建期 `busy=true` 时 `drill()` 首行静默 return；下钻前须等 `busy=false && !stage`。面包屑根类名是 `.map-nav`。

### 2026-10-21 两图合并为单实例下钻大屏（echarts geo）
- 单实例按 `level` 切 option（`setOption(opt,true)` 全量替换）；全国 `registerMap` 一次，省份按需注册。下钻：`click` → `params.name` 匹配 PROVINCE_OPTIONS 取 adcode。落点 `chart-dashboard.service.ts`。

### 2026-10-20 @visactor/vchart v2 × Vue3（落点 `pages/vchart/components/*.vue`）
- `resize()` 需 2 参 → 用 `autoFit:true` 自动重绘。折线+面积是 `type:'area'`。
- `ISpec` 未导出 → `type VChartSpec = ConstructorParameters<typeof VChart>[0]` 标返回类型保住字面量。
- 双轴须 `type:'common'` + `series:[{type:'bar',id:'bar0'},{type:'line',id:'line0'}]`，`axes` 用 `seriesId` 绑定（无 `yAxisIndex`）。
- 缩略轴用顶层 `dataZoom`，`previewData` 不在类型接口。柱图 `xField/yField`（`categoryField` 是饼图专属）。
- 主题走 spec 级 `theme` + `updateSpec()`；轴指示是 `crosshair:{xField/yField:{...}}`，不是 `axisPointer`。

### 2026-10-20 其余接缝（各 1~2 行）
- **service 数据 × computed × echarts**：service 字段未 ref 化 → computed 追踪不到 → 图表不更新；统一 `ref()/reactive()` 再进 computed。
- **threejs 飞线线宽**：飞线是正对相机的三角带、线宽为**世界单位**；拉远后屏宽 <1px 且 EffectComposer renderTarget 无 MSAA → 断线。Tick 传 `ViewportMetrics`，按中点到相机距离算 worldPerPx，半宽下限 `STREAK=2/TRACK=1.2/HEAD=6`。另 flex 列里「展开态」项写 `margin-top:auto` 会吃掉自由空间致 `flex-grow` 失效。
- **底图强度 × 内联样式**：内联 `opacity` 盖掉 `.xx--hidden{opacity:0}` → 显隐失效；内联只注 `--bg-opacity`，样式表写 `var(--bg-opacity,1)`。
- **底板 × 相机轨道中心**：每帧 `syncToFocus(controls.target)` 只同步 x/y、z 恒 -0.6 防共面闪烁。
- **星空 × 亮色主题**：加法混合白色星芒在浅底糊成脏点；viewport 暴露 `setStarfieldVisible()` 并内部记住意图（theme watcher 可能先于 `start()`）。
- **加密文件读写**：Read/grep 读密文有「假明文」，Edit 匹配密文必失败；`git show ":<path>" > tmp && cat tmp > <path>` 恢复明文再改，写完用 python 复验。

## 历史经验（已下线，仅留结论）
- **AG Grid v32**（模块已移除）：主题类必须挂**祖先**元素（挂 `<AgGridVue class>` 会被丢 → 列头行高塌 0、整块空白）；`ag-grid-vue3` 多套一层无类名 div，容器需 `display:grid` + 确定高度；增删行用 `applyTransaction`。
