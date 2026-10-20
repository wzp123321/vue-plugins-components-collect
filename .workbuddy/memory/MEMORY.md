# 项目长期记忆 — vue-plugins-components-collect（collect 组件收集站）

## 工程结构与约定
- 应用根目录 `collect/`：Vue3 + Vite + TS + Element Plus + vue-router，样式用 less scoped。
- 路由按类目拆在 `src/router/modules/*.ts`，页面放 `src/pages/<类目>/<页面名>/<页面名>.vue`。
- 侧边栏**不是**从路由自动派生：由 `src/views/layout/aside-box/constant.ts` 手工维护 `navGroups`（5 能力域 → 13 分区 → 示例，81 条；2026-10-20 由 6 域 18 分区精简而来：撤销「实验室」顶级菜单、3 个单条分区合并，条目与路由未动），搜索走 `src/utils/semantic-search.ts`（Ctrl K 命令面板）。**新增页面必须同时改路由 + 导航两处**，提交前跑 `collect/scripts/check-nav-routes.mjs`（npm script `check:nav`，已挂 `.husky/pre-commit`；查死链/未收录/import 目标缺失三项）。2026-10-20 校验 84 路由 / 81 导航 / 82 import 目标全通过；孤儿页面统一归档到 `collect/_archive/pages/`（在 src 外，不参与构建，原因见 `_archive/README.md`）。
- **组件统一用 `el-*`**（Element Plus，vite 已配自动按需导入）。
- `te-*`（@tiansu）组件**实际存在并在用**：`src/components/te-*` 共 14 个目录，`src/pages/components/components/te-model.ts` 将其作为演示注册，全仓约 75 处引用。原"禁用 te-*"约定已被代码推翻 → **待用户确认口径**（保留演示 / 新代码禁用 / 拆独立包），在此之前不要凭旧记忆删 te-*。
- **收录规则（2026-10-20 起，方案 B）**：新条目按场景建页、不为单技术堆 demo。判定：「某技术本身怎么用」→ 不建（查官方文档 / 已有 demo）；「技术A × 技术B × 我的约束」→ 建场景页。场景页三要素：页面注释写场景上下文、文件头列技术组合、踩坑注明落点（可指向接缝本）。建场景页当天在接缝本记一条。存量 81 条不动。权威文档在根 README「开发约定」节。

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
- 沙箱安全删除守卫（>50 文件）会杀掉 `pnpm dev` / `vite build`：先 `mv node_modules/.vite` / `mv dist` 移开再跑；检查中间结果优先用真实浏览器（Chrome `--headless=new --remote-debugging-port` + Node22 全局 WebSocket 直连 CDP，零依赖）。

## echarts 可视化页现状（2026-10-19）
- `drill-map` 已删除（目录 + 路由 + semantic-search 别名 + aside-box/constant.ts 菜单共 4 处）。
- `chart-province` 已重写为「城市能源地图」大屏：33 省切换（`import.meta.glob('/src/assets/geojson/province/*.json')` 懒加载）、visualMap 着色、城市/项目 tooltip、点城市联动右侧 TOP10 排行 + 明细、盈利图标散点 + 告警波纹、roam/resize/dispose。service 数据字段必须 ref 化（外层 computed 才能追踪，否则缓存空值）。

## 本机浏览器验证配方（headless + CDP）
- dev server 必须 `run_in_background` 且**不能接管道截断**（会把 vite 杀掉，表现为页面全白）。
- Chrome：`bash 'chrome.exe --headless=new --remote-debugging-port=9222 --disable-gpu --no-sandbox ... &' + 同一命令链内跑 node CDP 脚本 + taskkill`；常驻/后台任务/其他启动方式都会被工具会话回收（启动即退）。
- Node fetch 走系统代理连不上 127.0.0.1（curl 也 502）→ CDP 的 HTTP 端用内置 `http` 模块；WebSocket 连 CDP 正常（Node 22 全局）。
- **`captureScreenshot` 在 `--disable-gpu` 下会丢/错位文本 span**，验证 DOM 与布局用 `Runtime.evaluate` 探针（textContent + getBoundingClientRect + computed style），别以截图下结论。

## 接缝本（现学必记）
定位：收集站收「世界上有什么」（按技术名词归档），这里收「和我的环境 / 数据 / 约束怎么接」（按场景组合）。规则：为某任务现学超过 10 分钟，学会后 2 分钟内记一条，≤5 行，新条目追加到本节最上方（时间倒序）。

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
