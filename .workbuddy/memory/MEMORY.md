# 项目长期记忆 — vue-plugins-components-collect（collect 组件收集站）

## 工程结构与约定
- 应用根目录 `collect/`：Vue3 + Vite + TS + Element Plus + vue-router，样式用 less scoped。
- 路由按类目拆在 `src/router/modules/*.ts`，页面放 `src/pages/<类目>/<页面名>/<页面名>.vue`。
- 侧边栏**不是**从路由自动派生：由 `src/views/layout/aside-box/constant.ts` 手工维护 `navGroups`（5 能力域 → 13 分区 → 示例，81 条；2026-10-20 由 6 域 18 分区精简而来：撤销「实验室」顶级菜单、3 个单条分区合并，条目与路由未动），搜索走 `src/utils/semantic-search.ts`（Ctrl K 命令面板）。**新增页面必须同时改路由 + 导航两处**，提交前跑 `collect/scripts/check-nav-routes.mjs`（npm script `check:nav`，已挂 `.husky/pre-commit`；查死链/未收录/import 目标缺失三项）。2026-10-20 校验 84 路由 / 81 导航 / 82 import 目标全通过；孤儿页面统一归档到 `collect/_archive/pages/`（在 src 外，不参与构建，原因见 `_archive/README.md`）。
- **组件统一用 `el-*`**（Element Plus，vite 已配自动按需导入）。
- `te-*`（@tiansu）组件**实际存在并在用**：`src/components/te-*` 共 14 个目录，`src/pages/components/components/te-model.ts` 将其作为演示注册，全仓约 75 处引用。原"禁用 te-*"约定已被代码推翻 → **待用户确认口径**（保留演示 / 新代码禁用 / 拆独立包），在此之前不要凭旧记忆删 te-*。
- **收录规则（2026-10-20 起，方案 B）**：新条目按场景建页、不为单技术堆 demo。判定：「某技术本身怎么用」→ 不建（查官方文档 / 已有 demo）；「技术A × 技术B × 我的约束」→ 建场景页。场景页三要素：页面注释写场景上下文、文件头列技术组合、踩坑注明落点（可指向接缝本）。建场景页当天在接缝本记一条。存量 81 条不动。权威文档在根 README「开发约定」节。

## three.js 地图模块（2026-10-21 升到 0.173，以下为硬约束）
- 依赖：`three ^0.173.0` + `@types/three ^0.173.0`，**两包必须同步升**（0.173 包内无任何 .d.ts，也没有 types 字段）。私有 Nexus 对 three 返回 403，`collect/.npmrc` 已把 `registry` 指回官方源、`@tiansu` 仍走私有源。
- **颜色管线刻意保留旧行为**：`src/three-compat.ts` 关掉 `ColorManagement`，`useMapViewport` / `useThreeScene` 两个 renderer 都设 `outputColorSpace = LinearSRGBColorSpace`。别"顺手升级"成 sRGB 输出 —— 0.147 的链路等价于跳过 gamma 解码，看起来更亮；走正确管线整套配色会集体变暗（省份底色、界线对比全变），需要重新调色。
- **光照必须过 `legacyIntensity()`**（`pages/threejs/shared/lighting.ts`，×π）：r160 删了 `useLegacyLights`，不补偿会暗 3.14 倍。
- **draw call 约束**：`ExtrudeGeometry` 按 shape 分组、且产出**非索引几何**，多个 shape 合并后必须调 `collapseExtrudeGroups()`（先补 0..N-1 索引再按 materialIndex 重排），否则组数 = shape 数 × 2，合并 geometry 等于没合。边界线统一用 `LineSegments2` + 单个 geometry。
- 左上角 `MapPerfPanel` 常显 FPS / calls / tris（左上角先被 `.map-search` 占着，面板在 `left:268px`）。`renderer.info.autoReset` 已关，每帧手动 reset 才能统计整帧两趟渲染。

## AG Grid（ag-grid-community / ag-grid-vue3 v32）集成硬约束（2026-10-19 核实：ag-grid 已不在 package.json、src 0 引用，本节仅作历史经验保留）
1. **主题类必须挂在网格的祖先元素上**。挂在 `<AgGridVue class="ag-theme-quartz">` 标签上会被丢弃 → 主题规则全不生效 → 列头与行高塌成 0、被 overflow 裁光，表现为"表格整块空白、新增行列都没反应"，但数据其实都在。
   原理：AG Grid 的 `Environment.readAncestorThemeClasses()` 从网格根元素**向上遍历祖先**收集 `ag-theme-*`，并把这些类**复制到弹层元素**。
   正确写法：`<div class="grid-wrap ag-theme-quartz"><AgGridVue ... /></div>`。
2. `ag-grid-vue3` 会在网格外**多套一层无类名 div**（高度 auto），导致 `.ag-root-wrapper{height:100%}` 的百分比高度链断裂。容器需 `display: grid`（单格 grid 默认拉伸该中间层）**且**有确定高度（如 `flex:1 1 auto` + `height: calc(100vh - 320px)` + `min-height`）。
3. 动态增删行用 `gridApi.applyTransaction({add|remove})`；行高/表头高来自主题 CSS 变量，不要自己设。
4. 弹层（筛选面板/菜单）主题开箱可用；内置文案是英文，需要中文就配 `localeText`。
5. `xlsx` 锁 `0.18.5`（官方新版转 CDN 商业分发）。

## 本机环境坑
- 亿赛通透明加密：本工程 `.md` 被加密。读用 `head -c N "$f"`；判断密文 `tr -dc '\0' < "$f" | wc -c`（>0 即密文）；写用 Edit/Write 工具或 bash `>` 重定向才产出明文。
- 沙箱安全删除守卫（>50 文件）会杀掉 `pnpm dev` / `vite build`。2026-10-20 修正：**别靠 `mv node_modules/.vite` 绕** —— 移开缓存会触发全量重优化，optimizer 提交阶段 `rm deps_temp_*`（本次 58 文件）照样被拦、进程直接退出（表现为 ready 之后浏览器 ERR_CONNECTION_REFUSED）。缓存存在时别动它；已移开的 `mv .vite-bak-* .vite` 移回去即可。检查中间结果优先用真实浏览器（Chrome `--headless=new --remote-debugging-port` + Node22 全局 WebSocket 直连 CDP，零依赖）。2026-10-21 补充：整包 `vite build` 在 transform 完成后的 bundle 阶段被 SIGTERM 杀（emptyOutDir / minify / outDir 怎么设都杀，transform 阶段恒零报错）；dev server 按需编译一旦发现新依赖（如 `three/examples/jsm/controls/OrbitControls`）触发 optimizer commit `rm deps_temp` 即被守卫杀 → 本机产不出完整生产包，代码正确性以 `ts-check` + transform 零报错为准，完整包须用户本机 `npm run build` 收口。

## echarts 可视化页现状（2026-10-21）
- `drill-map` 已删除。
- `chart-map`（中国地图大屏）与 `chart-province`（城市能源地图）已合并为 **`chart-dashboard`（地图可视化大屏）**：单一 ECharts 实例按 `level` 字段切换「全国视角（china-national + 可点省份下钻）」与「省份视角（懒加载 geojson + TOP10 + 明细）」。
  - 全国地图 `assets/geojson/china.json`（35 省级要素，含 adcode+name，点击按 name 匹配 PROVINCE_OPTIONS 下钻）；省份 `assets/geojson/province/*.json`（33 省，`import.meta.glob` 懒加载）。
  - 旧 `chart-map.vue/service`、`cm-line/cm-water` 空壳、`chart-province` 整套已归档 `_archive/pages/`；`cm-bar/cm-gauge` 保留作全国 KPI 面板。
  - 路由 `/echarts-map`→新页；`/echarts-province`→redirect 到 `/echarts-map`，nav 标记 `searchOnly:true`。

## 本机浏览器验证配方（headless + CDP）
- dev server 必须 `run_in_background` 且**不能接管道截断**（会把 vite 杀掉，表现为页面全白）。
- Chrome：`bash 'chrome.exe --headless=new --remote-debugging-port=9222 --disable-gpu --no-sandbox ... &' + 同一命令链内跑 node CDP 脚本 + taskkill`；常驻/后台任务/其他启动方式都会被工具会话回收（启动即退）。
- Node fetch 走系统代理连不上 127.0.0.1（curl 也 502）→ CDP 的 HTTP 端用内置 `http` 模块；WebSocket 连 CDP 正常（Node 22 全局）。
- **`captureScreenshot` 在 `--disable-gpu` 下会丢/错位文本 span**，验证 DOM 与布局用 `Runtime.evaluate` 探针（textContent + getBoundingClientRect + computed style），别以截图下结论。

## 接缝本（现学必记）
定位：收集站收「世界上有什么」（按技术名词归档），这里收「和我的环境 / 数据 / 约束怎么接」（按场景组合）。规则：为某任务现学超过 10 分钟，学会后 2 分钟内记一条，≤5 行，新条目追加到本节最上方（时间倒序）。

### 2026-10-21 CDP 探针 × Vue 内部状态（三个 Silent-Fail 坑）
- 坑1：`Runtime.evaluate` 表达式里写 async IIFE 必须传 `awaitPromise:true`，否则拿回 Promise 对象、`result.value` 恒 undefined（日志表现为打 `{}`，像「没进函数」）。
- 坑2：Vue3 `instance.setupState` 是 `proxyRefs` 代理，**读取即解包**：`setupState.mapRef` 直接就是 public instance（不是 ref 对象），对它再 `.value` 恒 undefined → 误判「模板引用没绑上」。绑定判断改用 `instance.proxy.$refs.xxx`。
- 坑3：threejs 地图重建期间 `busy=true`，此时 `drill()` 第一行静默 return（无异常无 toast）——自动化触发下钻前必须等 `busy=false && !stage`，否则像「功能坏了」白查半天。另：面包屑根类名是 `.map-nav`（按 `.map-nav-bar` 查永远 absent）。
- 落点：threejs 地图页下钻态验证探针（模板已清理，复用时照抄这三条）

### 2026-10-21 两图合并为单实例下钻大屏（echarts geo）
- 坑：两个 echarts geo 地图页（中国地图大屏占位死 demo + 省份地图成品）各自独立 service，重复地图模式。
- 解法：合成 `chart-dashboard`，**单一 ECharts 实例按 `level` 字段切换 option**（`setOption(opt,true)` 全量替换），全国 `registerMap('china-national', china.json)` 一次，省份 `import.meta.glob` 按需 `registerMap(adcode, geo)`。
- 下钻：全国地图 `click` → 用 `params.name` 匹配 PROVINCE_OPTIONS 取 adcode → `drillToProvince`。
- 落点：`collect/src/pages/echarts/chart-map/chart-dashboard.service.ts`

### 2026-10-20 @visactor/vchart v2 × Vue3 图表页（接缝）
- 坑1：`chart.resize()` 在 v2 需 2 参 `(width,height)`，0 参报错；手写监听易漏。
- 解法1：spec 加 `autoFit: true`，容器尺寸变化自动重绘，删掉手动 resize 监听。
- 坑2：折线+面积不是 `type:'line'` + `area` 字段（ILineChartSpec 无 area）；雷达/面积要 `type:'area'`。
- 坑3：`ISpec` 未从包根导出，函数返回 spec 字面量会被拓宽成 `string` 导致赋值失败。
- 解法3：`type VChartSpec = ConstructorParameters<typeof VChart>[0]`，给 buildSpec 标返回类型即保住字面量。
- 坑4（进阶·双轴组合图）：VChart 无 echarts 的 `yAxisIndex`，混搭柱+线须 `type:'common'` + `series:[{type:'bar',id:'bar0'},{type:'line',id:'line0'}]`，`axes` 用 `seriesId:['bar0'/'line0']` 绑定左右轴。
- 坑5（进阶·缩略轴）：区间缩放用顶层 `dataZoom:[{orient:'bottom',start,end}]`；`previewData` 不在类型接口、别用（只出滑块不出迷你预览）。
- 坑6（进阶·柱图字段）：柱图是 `xField/yField`，`categoryField/valueField` 是饼图专属，混用直接类型报错。
- 坑7（进阶·主题）：明暗切换走 spec 级 `theme:'dark'|'light'` + `updateSpec()`，区别于 echarts 全局 `registerTheme`。
- 坑8（进阶·crosshair）：轴指示结构是 `crosshair:{ xField/yField:{visible,line:{style},label} }`，不是 echarts 的 `axisPointer`。
- 落点：`collect/src/pages/vchart/components/*.vue`（基础 5 + 进阶 4，已校验 ts-check 双绿）

### 2026-10-20 service 返回数据 × Vue3 computed × echarts 图表页
- 坑：service 数据字段未 ref 化 → 外层 computed 追踪不到 → 缓存空值、图表不更新
- 解法：service 返回字段统一 `ref()` / `reactive()` 化后再进 computed
- 落点：`collect/src/views/echarts/` 城市能源地图页

### 2026-10-20 加密文件 × .md/.java × 读取与校验（指向型）
- 坑：head / grep / Read 读密文有「假明文」现象，Edit 匹配密文 old_string 必失败
- 解法：`git show ":<path>" > tmp && cat tmp > <path>` 恢复明文再改；写完用 python 复验（非白名单读取器）
- 落点：用户级 MEMORY.md「亿赛通」节 + 技能 `esafenet-plaintext-convert`

### 2026-10-20 threejs 飞线线宽 × 缩放 × 断线（接缝）
- 坑：飞线是会正对相机的三角带，线宽写在**世界单位**里；相机拉远后屏幕宽度 <1px，
  而后处理链（EffectComposer）的 renderTarget 默认无 MSAA → 覆盖率不稳定，断成一截一截
- 解法：`useMapViewport` 的 Tick 多传 `ViewportMetrics{width,height,pixelRatio}`；
  每条线按「中点到相机距离」算 worldPerPx，给半宽下限 `MIN_STREAK_PX=2 / TRACK=1.2 / HEAD=6`
- 坑：flex 列里给「展开态」的项写 `margin-top:auto` 会先吃掉自由空间，`flex-grow` 直接失效
- 落点：`composables/useMapViewport.ts`、`composables/useFlyLines.ts`、`utils/drawFlyLine.ts`、
  `threejs-china-3d-map.vue`（右栏 `.china3d-rail` + `--rail-shift`）

### 2026-10-20 底图强度 × 内联样式 × CSS 变量（接缝）
- 坑：给 DOM 底图加「可调强度」时直接内联写 `opacity`，会盖掉 `.xx--hidden{opacity:0}`（内联优先级高于类选择器），显隐开关失效
- 解法：内联只注入 `--bg-opacity`，样式表写 `opacity: var(--bg-opacity, 1)`；显隐仍归类管
- 落点：`ChinaMap3D.vue`（`bgImageStyle` / `.map-bg-image`）、`MapControlPanel.vue`（强度滑块）

### 2026-10-20 世界坐标底板 × 相机轨道中心（接缝）
- 坑：底板 mesh 固定在世界原点时，地图平移 / 下钻后圆环偏到一边，像「盘子歪了」
- 解法：每帧 `syncToFocus(controls.target)`，只同步 x/y、z 恒定 -0.6 防共面闪烁；位移 <1e-3 时跳过省矩阵更新
- 落点：`composables/useGroundPlane.ts`、`ChinaMap3D.vue`（`viewport.onTick` 内）

### 2026-10-20 星空 × 亮色主题（接缝）
- 坑：加法混合的白色星芒在浅底上糊成一片「脏点」；starfield 自身没有主题概念
- 解法：viewport 暴露 `setStarfieldVisible()`，并在内部记住意图（主题 watcher 可能先于 `start()` 触发）
- 落点：`composables/useMapViewport.ts`、`ChinaMap3D.vue` 的 theme watcher
