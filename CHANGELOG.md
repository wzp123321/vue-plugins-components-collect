# Changelog

本文件**手动维护**，不接 CI、不自动生成，遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 约定。

- 条目按类型分组：**Added**（新功能）/ **Changed**（变更）/ **Fixed**（修复）/ **Docs**（文档）/ **Chore**（杂项）。
- 版本号与 `collect/package.json` 的 `version` 对齐（当前为 `0.0.0`）。
- 工作流：日常改动先记到 `## [Unreleased]`；每次发版时把 `Unreleased` 改名为版本号 + 日期。

---

## [Unreleased]

### Added
- Three.js 中国 3D 地图模块 `threejs-china-3d-map`：
  - 立体板块（ExtrudeGeometry + 侧壁 Shader 渐变/扫描）、飞线 ribbon、数据柱 billboard。
  - Z-up 相机防翻面、指针拾取、选择性泛光（camera.layers）。
  - 下钻↔详情面板双向联动（`MapDetailPanel.vue`）、左下/右下 DIY 图表联动（`MapDashBoard.vue`）。
  - 大屏装饰层与交互工具、搜索框移至左上角、交互说明改为「图标 + 悬浮框」（`MapHintFab.vue`）。
  - 配套 API 文档：`src/pages/threejs/ThreeJS-3D地图-API文档.md`（含伪代码章节）。
- Excel 数据录入台 `excel-data-entry-vxe`：单元格编辑器、校验、历史、查找替换、序列填充、A/B 组交互。

### Changed
- 重构为 monorepo 后的目录与路由持续收敛（collect / mobile-component / terminal / dependencies-guard）。
- 命令面板（Ctrl+K）检索升级为**本地语义检索**：`searchNav` 由纯 substring 匹配改为同义词扩展 + 加权打分（`src/utils/semantic-search.ts` 新增；`src/views/layout/aside-box/constant.ts` 的 `searchNav` 改为委托）。支持中文意图（如「拖拽排序的看板」）、英文同义词（如 `deep clone`）与针对单个 demo 的意图别名召回，零后端、零 API key。

### Fixed
- 清理废弃组件页面与路由（删除飞鸟乐园旧源码）。

### Docs
- 为 3D 中国地图与 Excel 录入台补充详细中文注释。

### Removed
- 删除空目录 `src/pages/order-management/`（无页面、无路由）。
- 删除重复演示 `threejs-map`（实为红色立方体基础场景，与 `threejs-basic` / `threejs-scene` 重复，导航名"三维地图"误导，且含预存 TS6133 报错）。
- 合并两个 Excel 导出演示：保留 `/form-export-to-excel`，移除重复的 `/form-table-export-excel`（两者均为 ExcelJS 带样式导出同一份数据）。

---

## Baseline（建立 changelog 前的历史累计，无独立版本号）

以下功能在 `CHANGELOG` 机制建立前已合入 `main`，此处仅做事实性归集：

### Added
- 项目由「飞鸟乐园」初始化代码重构为 Vue3 插件/组件收集站（monorepo）。
- Jspreadsheet CE 电子表格完整功能演示页。
- Chrome TTS 文字语音播报演示页面。
- 树形穿梭组件 `tree-select-transfer` 与二维码组件 `qr-code`。
- 数据驾驶舱大屏页面与配套组件。
- 多个业务组件与工具函数（含 `te-*` 组件演示，约 14 个目录，在 components 页注册）。

### Changed
- `axios-demo` 拆分为子组件，代码解耦。
- `v-inputFilter` 指令重构。

### Chore
- 批量更新依赖与代码规范。

---

> 约定备注：`te-*`（@tiansu）组件当前在 `src/pages/components` 作为演示使用（全仓约 75 处引用）。
> 旧「禁用 te-*」约定已被代码推翻，口径待确认（保留演示 / 新代码禁用 / 拆独立包）。
