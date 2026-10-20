# vue-plugins-components-collect

一个用于**学习、对比、收藏**的 Vue3 插件与组件实验场。  
按业务场景把常用前端插件封装为独立可运行的演示页，全部基于同一个 `collect` 子项目路由化展示，开箱即用。

> 当前收录 **6 个能力域 · 81 个可运行示例**（含 1 个 jspreadsheet-ce 完整功能演示页）。

---

## 仓库地图

本仓库是**多项目拼装结构**（非 pnpm workspace monorepo）：只有 `collect/` 是演示应用主体，其余三个是各自独立的 npm 项目，随用随取：

| 目录                    | 身份                                              | 规模（git 跟踪文件） | 说明 |
| ----------------------- | ------------------------------------------------- | -------------------- | ---- |
| `collect/`              | 本仓库主体：Vue3 + Vite + TS 演示应用             | ~586                 | 81 个示例按 6 能力域组织，开发/构建都在这里 |
| `mobile-component/`     | `ts-mobile-ui`：UniApp / UniApp-X 移动端组件库    | ~1515                | 独立项目，自带 VitePress 文档站，详见其 README |
| `terminal/`             | `terminal-project`：终端相关实验                  | ~47                  | 独立项目（Vue3 + TS + Vite 模板起步） |
| `dependencies-guard/`   | `demo-pro`：依赖守门实验                          | ~22                  | 独立项目，验证依赖白名单/守卫机制 |

---

## 目录

- [仓库地图](#仓库地图)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [脚本命令](#脚本命令)
- [插件目录](#插件目录)
- [新增 jspreadsheet-ce 电子表格](#新增-jspreadsheet-ce-电子表格)
- [开发约定](#开发约定)
- [常见问题](#常见问题)

---

## 项目结构

仓库为多项目拼装结构，仅 `collect/` 目录为可运行的 Vue3 应用主体（各目录身份见上方[仓库地图](#仓库地图)）：

```text
vue-plugins-components-collect/
├── collect/                       # 主体：Vue3 + Vite + TypeScript 演示应用
│   ├── src/
│   │   ├── pages/                 # 各演示页（按类目分目录，不止 plugins）
│   │   ├── components/            # 公共组件
│   │   ├── hooks/                 # 组合式函数
│   │   ├── services/              # 接口请求封装
│   │   ├── router/                # 路由配置（modules/*.ts 按类目拆分）
│   │   ├── store/                 # Pinia 状态
│   │   ├── directives/            # 自定义指令
│   │   ├── utils/                 # 工具方法
│   │   ├── views/                 # 布局与框架（含侧边栏导航 constant.ts）
│   │   └── assets/                # 静态资源
│   ├── _archive/                  # 已归档的孤儿页面（不参与构建）
│   ├── vite.config.ts
│   └── package.json
├── mobile-component/              # ts-mobile-ui：UniApp 组件库（独立项目）
├── terminal/                      # terminal-project（独立项目）
├── dependencies-guard/            # demo-pro（独立项目）
├── README.md
└── package.json
```

`collect/src/pages/plugins/` 下的每个子目录对应一个插件主题，目录名与路由路径基本一致。

---

## 快速开始

环境要求：**Node.js ≥ 18**、**pnpm ≥ 9**（项目使用 pnpm 安装与锁版本）。

```bash
# 安装依赖
cd collect
pnpm install

# 启动开发服务（默认端口 9707，端口占用时顺延）
pnpm dev

# 浏览器打开
# http://localhost:9707/
```

> **注意**：项目使用本地 pnpm v10 + lockfile v9。如果全局 pnpm 是 v11，安装时会重新解析 lockfile。
> 推荐改用与 lockfile 同代版本，或使用 `pnpm install --frozen-lockfile` 保证依赖一致。

---

## 脚本命令

所有命令在 `collect/` 目录下执行：

| 命令                   | 说明                                            |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`             | 启动 Vite 开发服务器                            |
| `pnpm build`           | 注入 commitId + 类型检查 + 生产构建（并行执行） |
| `pnpm ts-check`        | 仅做 TypeScript / vue-tsc 类型检查              |
| `pnpm preview`         | 预览构建产物（端口 8090）                       |
| `pnpm lint:html`       | ESLint 检查 `.js/.vue/.ts/.html`                |
| `pnpm lint:css`        | Stylelint 检查样式                              |
| `pnpm fix`             | 自动修复 HTML / CSS 问题                        |
| `pnpm prettier-format` | Prettier 格式化源码                             |
| `pnpm check:nav`       | 校验导航与路由双向一致（pre-commit 自动执行）   |

---

## 插件目录

所有插件页均位于 `collect/src/pages/plugins/` 下，路由注册见 [plugins.ts](collect/src/router/modules/plugins.ts)。

| 路由                         | 中文名               | 插件 / 库                                                            | 主要演示内容                                                                                                                                                                                                                                   |
| ---------------------------- | -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/vue3SlideVerify`           | 滑动验证             | [vue3-slide-verify](https://www.npmjs.com/package/vue3-slide-verify) | 滑块拼图验证码                                                                                                                                                                                                                                 |
| `/plugins-vueuse`            | vueuse               | [@vueuse/core](https://vueuse.org/)                                  | useDebounce / useThrottle / useFullscreen / useLongPress / useMousePosition / useResizeObserver / useFileDialog / useImage / useMediaControls / useMutationObserver / useWindowFocus / useWindowScroll / useMouseInElement 等 12+ 个组合式 API |
| `/plugins-draggable-formula` | 拖拽公式             | vuedraggable + 自研                                                  | 拖拽生成条件公式，多条件组合、分组、引用                                                                                                                                                                                                       |
| `/plugin-word-pdf-preview`   | 文件预览下载         | @vue-office/docx / pdf / excel                                       | docx / pdf / excel 文件在线预览与下载                                                                                                                                                                                                          |
| `/pluginsLittle`             | 小插件               | crypto-js / canvas                                                   | Canvas 绘图、加解密（AES / Base64 / MD5 等）                                                                                                                                                                                                   |
| `/plugins-jspreadsheet-ce`   | jspreadsheet电子表格 | [jspreadsheet-ce](https://bossanova.uk/jspreadsheet/) + jsuites      | 4 个工作表覆盖全部核心功能（详见下文）                                                                                                                                                                                                         |

### 页面收录现状

所有可访问的演示页均已挂载导航（6 能力域 → 分区 → 示例，定义在 `collect/src/views/layout/aside-box/constant.ts`）。
历史上存在过一批未接线的实验页面，已于 2026-10-20 归档至 [`collect/_archive/`](collect/_archive/README.md)，不再随构建分发。

---

## 新增 jspreadsheet-ce 电子表格

> 路径：[`/plugins-jspreadsheet-ce`](collect/src/pages/plugins/plugins-jspreadsheet-ce/plugins-jspreadsheet-ce.vue)
> 文件：[plugins-jspreadsheet-ce.vue](collect/src/pages/plugins/plugins-jspreadsheet-ce/plugins-jspreadsheet-ce.vue)

### 安装

```bash
cd collect
pnpm add jspreadsheet-ce jsuites
```

> `jspreadsheet-ce` 的日历、下拉、颜色等扩展依赖 `jsuites`，必须同代（5.x）显式安装，否则样式与组件不会正常加载。

### 功能覆盖

页面以 **4 个工作表 + 5 组 API 按钮 + 实时事件日志** 的形式，把 jspreadsheet-ce 的核心能力都跑了一遍：

#### Sheet1 - 列类型

text / numeric(千分位) / calendar / dropdown(单选+多选) / checkbox / radio / color / image / autocomplete / html / hidden / 只读 / 自定义 render。

#### Sheet2 - 表头样式

- `nestedHeaders` 嵌套表头
- `mergeCells` 合并单元格
- `comments` 单元格批注
- `style` 内联样式
- `freezeColumns` + `freezeRows` 行列冻结
- `tableOverflow` 表格滚动容器

#### Sheet3 - 公式排序

- 单元格公式 `=B*C`
- `footers` 页脚 `=SUM` 汇总
- `columnSorting` 列排序

#### Sheet4 - 分页过滤

- `pagination` + `paginationOptions`
- `filters` 过滤
- `search` 搜索
- `lazyLoading` 懒加载
- `rowDrag` 行拖拽
- `csvFileName` 导出文件名

#### API 演示（5 组按钮）

| 组别           | 覆盖 API                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 数据操作       | getData / setData / getValue / setValue / getRowData / setRowData / getColumnData / setColumnData / getDataFromRange      |
| 行列操作       | insertRow / deleteRow / moveRow / insertColumn / deleteColumn / moveColumn / hideColumn / showColumn / undo / redo        |
| 表头样式       | setHeader / getHeaders / setStyle / getStyle / setComments / getComments / setMerge / destroyMerge / setWidth / setHeight |
| Sheet 导入导出 | createWorksheet / deleteWorksheet / openWorksheet / download / 导出 JSON / 全屏                                           |
| 其它           | orderBy 排序 / page 翻页 / openFilter / 选区 / executeFormula / openEditor                                                |

#### 事件演示

通过 `onload` / `onbeforechange` / `onchange` / `onafterchanges` / `onselection` / `oninsertrow` / `ondeleterow` / `onmoverow` / `oninsertcolumn` / `ondeletecolumn` / `onmovecolumn` / `onresizerow` / `onresizecolumn` / `onsort` / `onmerge` / `onfocus` / `onblur` / `onchangeheader` / `oneditionstart` / `oneditionend` / `onundo` / `onredo` / `onpaste` 等 20+ 个事件钩子，把所有用户交互记录到底部 macOS 风格深色终端日志中，可通过开关暂停/继续。

#### 自定义工具栏

通过 `toolbar` 选项演示自定义按钮（含分隔符），并通过 `addLog` 记录点击。

### 路由注册

在 [plugins.ts](collect/src/router/modules/plugins.ts) 中追加：

```ts
{
  path: '/plugins-jspreadsheet-ce',
  meta: { name: 'jspreadsheet电子表格' },
  component: () => import('../../pages/plugins/plugins-jspreadsheet-ce/plugins-jspreadsheet-ce.vue'),
},
```

### 注意事项

- `jspreadsheet-ce` 不依赖 Vue，是命令式 DOM 库，组件销毁时务必调用 `jspreadsheet.destroy(ref)` 避免内存泄漏（页面已在 `onBeforeUnmount` 处理）。
- 多 Sheet 时切换记得通过 `getActiveSheet()` 获取当前工作表实例；直接闭包会一直引用第一个 Sheet。
- CSS 主题靠 `:deep()` 覆盖 `.jss_worksheet` / `.jss_toolbar` / `.jtabs` / `.jss_pagination` 实现，不会污染项目其它表格。

---

## 开发约定

- **风格统一**：演示页位于 `pages/<类目>/<页面名>/<页面名>.vue`，可挂载 `*.api.ts` / `*.service.ts` / `model.ts` 作为附属文件。
- **路由**：按类目拆在 `collect/src/router/modules/*.ts`（14 个模块），`meta.name` 即页面标题。
- **导航（双注册，必改两处）**：新增页面除注册路由外，还必须在 `collect/src/views/layout/aside-box/constant.ts` 的 `navGroups` 补条目，否则侧边栏不可达。改动后执行 `pnpm check:nav` 校验两边一致（pre-commit 也会自动跑）。
- **样式**：使用 `lang="less" scoped`；覆写第三方库样式用 `:deep()`，避免污染全局。
- **图标**：统一使用 `@element-plus/icons-vue`。
- **数据**：本仓库偏演示性质，业务数据使用 mock，无真实接口依赖。
- **提交**：启用 husky + commitlint，遵循 conventional commit 规范（`feat:` / `fix:` / `docs:` / `chore:` 等）。

---

## 常见问题

**Q1. `pnpm install` 提示 store 版本不匹配？**
A. 项目 lockfile 是 pnpm v9 格式。如全局 pnpm 是 v11，建议使用 `npx -y pnpm@11 install --frozen-lockfile`；如全局 pnpm 是 v10，直接 `pnpm install` 即可。

**Q2. jspreadsheet-ce 表格渲染不出来？**
A. 检查 `jsuites` 是否安装且版本为 `^5.x`（与 jspreadsheet-ce v5 匹配）。`pnpm add jsuites@5` 后重启 dev server。

**Q3. 路由访问 404？**
A. 路由按类目注册在 `collect/src/router/modules/*.ts`，确认已加入对应模块的数组；同时检查侧边栏导航 `constant.ts` 是否补了条目（双注册）。可用 `pnpm check:nav` 一键排查两边不一致。

**Q4. ESLint / Stylelint 报错？**
A. 先 `pnpm fix` 自动修复大部分问题，剩余的根据提示手动处理。

---

## License

MIT - 内部学习 / 收藏用途，欢迎参考与修改。
