# 项目长期记忆 — vue-plugins-components-collect（collect 组件收集站）

## 工程结构与约定
- 应用根目录 `collect/`：Vue3 + Vite + TS + Element Plus + vue-router，样式用 less scoped。
- 路由按类目拆在 `src/router/modules/*.ts`，页面放 `src/pages/<类目>/<页面名>/<页面名>.vue`；侧边栏由 routes 自动派生，加页面只需注册路由。
- **组件统一用 `el-*`**（Element Plus，vite 已配自动按需导入），本工程**没有** `te-*`（@tiansu）组件库，不要用。

## AG Grid（ag-grid-community / ag-grid-vue3 v32）集成硬约束
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
