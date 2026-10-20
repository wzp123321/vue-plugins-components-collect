# 项目长期记忆 — vue-plugins-components-collect（collect 组件收集站）

## 工程结构与约定
- 应用根目录 `collect/`：Vue3 + Vite + TS + Element Plus + vue-router，样式用 less scoped。
- 路由按类目拆在 `src/router/modules/*.ts`，页面放 `src/pages/<类目>/<页面名>/<页面名>.vue`。
- 侧边栏**不是**从路由自动派生：由 `src/views/layout/aside-box/constant.ts` 手工维护 `navGroups`（6 能力域 → 分区 → 示例，81 条），搜索走 `src/utils/semantic-search.ts`（Ctrl K 命令面板）。**新增页面必须同时改路由 + 导航两处**，提交前跑 `collect/scripts/check-nav-routes.mjs`（npm script `check:nav`，已挂 `.husky/pre-commit`；查死链/未收录/import 目标缺失三项）。2026-10-20 校验 84 路由 / 81 导航 / 82 import 目标全通过；孤儿页面统一归档到 `collect/_archive/pages/`（在 src 外，不参与构建，原因见 `_archive/README.md`）。
- **组件统一用 `el-*`**（Element Plus，vite 已配自动按需导入）。
- `te-*`（@tiansu）组件**实际存在并在用**：`src/components/te-*` 共 14 个目录，`src/pages/components/components/te-model.ts` 将其作为演示注册，全仓约 75 处引用。原"禁用 te-*"约定已被代码推翻 → **待用户确认口径**（保留演示 / 新代码禁用 / 拆独立包），在此之前不要凭旧记忆删 te-*。

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
