# BI 数据录入台 —— 选型指南

> v1.2 · 2026-11-10 · 适用工程 `collect`（Vue 3.5 / TS 5.3 / Element Plus 2.10.5 / Vite 5）
> 用途：接到「做个表格录入页」时，在 vxe-table / vtable-sheet / Univer 三套里定一套，并明确哪部分必须自研。功能状态以代码为准；实现机制与坑见 `BI数据录入台-实现细节.md`。

## 一、结论速查

**先问两句**：① 填的数据要不要按固定字段落库？② 数据量级多大？

- 要按字段落库 → 表单式批量录入 → **vxe-table**（首选）
- 不要，用户自己摆弄的 Excel（公式 / 多 sheet / 保真往返）→ **Univer**
- 要 Canvas 的高性能底座 + Excel 式语义（公式栏 / 多 sheet / 合并 / A1 写法）→ **vtable-sheet**

| 场景 | 推荐 | 理由 |
| --- | --- | --- |
| Excel 式批量录入（几十～几万行，粘贴 / 填充 / 校验 / 提交） | **vxe-table** | DOM，单元格可嵌任意 Vue 组件，e2e 可断言文字，暗色随 CSS 变量；MIT，Pro 插件能力已自研替代 |
| 复杂报表填报（公式 / 多 sheet / 合并表头 / 保真导入导出） | **Univer** | Excel 语义最全；代价是 React 内核 + 体积最重 + 迁移 3x |
| 高性能底座 + Excel 式语义，且不能有商业许可风险 | **vtable-sheet** | MIT（自研公式引擎，无 GPL 传染）；本工程已实测接入（§二）；代价见下方三条硬伤 |
| 只读大数据（10 万行+） | **vtable-sheet**（关录入） | Canvas 内存最优；vxe / `el-table` DOM 吃紧 |
| 轻量表单（≤500 行、字段 ≤20、走审批流） | EP `el-form` + `el-table`，不引库 | 引库是杀鸡用牛刀 |

**vtable-sheet 的三条硬伤**（选它前先认账）：
1. 用户量小，周下载数百级，生态与踩坑资料远不及 vxe / Univer；
2. 公式引擎官方只承诺 40+ 内置函数，跨 sheet 引用、公式依赖追踪在官方文档里仍标 TODO；
3. **手动配置了单元格编辑器后，公式能力会被禁用**——录入台必然要配编辑器，等于两者只能选一个。

**兜底口径**：只能选一套 → **vxe-table 4.x 主包，不买 Pro**。工程内已跑通框选 / 填充柄 / TSV 粘贴 / 撤销 / 跨列校验 / Excel IO，全是自研代码、零商业插件依赖；DOM 可嵌 EP 组件、可 e2e、暗色随 CSS 变量；业务层已收口，换插件只重写渲染层。边界：10 万行+ 只读交 vtable-sheet，公式 / 多 sheet / 保真导出交 Univer。

- 混合场景「只读 + 偶尔改几格」按写入占比：>10% 走 vxe；<10% 走 vtable-sheet 只读 + 独立编辑弹窗。
- `exceljs` 保留为独立 IO 层（MIT、按需动态 import），不与表格库绑定；`xlsx@0.18.5` 已是 npm 末版且有公开安全告警，新页面不用它做解析入口。

## 二、工程基线与维护口径

- **三套并列维护：vxe / vtable-sheet / Univer**，无主备；按业务特征选，不新增第四套。同一需求按能力面同步对齐，架构上做不到的在第四章标 `✕`，评审时当场提出，不靠「降级为技术验证页」绕过。
- vtable-sheet 是 `@visactor/vtable` 的上层封装：`VTableSheet` → `WorkSheet` → `tableInstance: ListTable`。`pages/vtable-sheet` 录入页只保留 vtable-sheet 数据录入表格（关掉自带菜单栏 / 公式栏 / sheet 页签 / 撤销 UI，工具栏与右键菜单仍是自绘）；裸 `ListTable` 基础演示已移除，不参与选型对比。
- 业务层收口 `src/utils/bi-entry.ts`（列模型 / 校验 / IO / 撤销 / 跨列规则），外观收口 `src/assets/style/bi-entry.less`（`--bi-*` + `.bi-*`）。样式机制与 Univer 暗黑问题见 `BI数据录入台-实现细节.md` §7。
- 自研占比 vxe 75% / vtable-sheet 74% / Univer 46%：70% 以上工作量在校验、列模型、查询、IO、撤销、模板，与插件无关。**换插件 = 重写渲染 / 编辑器绑定层，规则引擎不动**。
- 「换插件」的真实成本已经测过一次：`ListTable` → `VTableSheet` 业务层零改动（`SheetData` 支持 `Record[]`，`IColumnDefine` 继承 `ColumnDefine`，`field` / `style` / `cellType` / `editor` / 嵌套 `columns` 全透传），成本集中在关闭 sheet 自带 UI、以及压掉它写死的复制粘贴快捷键。
- 硬指标（定给「新引库」）：DOM 渲染 + 开源 + 近年活跃且有用户量 → **只有 vxe 满足**；vtable-sheet 与 Univer 都是 Canvas，vtable-sheet 另有用户量问题，按此条一并出局。该筛选不约束工程内已收录的实现。

## 三、候选库对比

体积为 `node_modules` 内 UMD min 产物实测（gz 为 gzip 后），未安装的给量级估算。

| 方案 | 渲染 | 许可（商用） | 体积 min / gz | 结论 |
| --- | --- | --- | --- | --- |
| **vxe-table 4.x** | DOM | MIT 主包；Pro 插件（框选 / 剪贴板 / 打印 / 导出 / 透视）约 ¥1.4 万–2 万/插件，工程已自研替代 | UMD 499 KB、按需 204 KB | 批量录入首选；1 万–10 万行可用，10 万+ 编辑卡顿 |
| **vtable-sheet 1.26.8** | Canvas | MIT；公式引擎自研，不引 HyperFormula，无 GPL 传染 | 2604 KB / 637 KB（含底层 vtable 的 2242 / 534） | 唯一「MIT + Excel 语义」组合；用户量小、无 Vue wrapper、公式能力受限 |
| **Univer 1.3.0** | Canvas + React | Apache-2.0；Pro 商业（保真 `exchange`、透视、图表、打印 PDF、协作） | preset 2–4 MB / 0.8–1.5 MB（估算） | 复杂报表唯一选；React 内核，Vue 侧只能手写 mount |

**已排除**（不占对比列，结论留档）：

- **AG Grid**：框选 / 剪贴板 / 撤销 / Excel 导出全在 Enterprise（$999/开发者起，无 key 生产环境水印），主题体系与 EP 割裂。
- **Handsontable**：按最终用户数计价；开源公式引擎 HyperFormula 为 GPLv3，商用有传染风险；无官方 xlsx 导出。
- **Luckysheet / FortuneSheet**：前者已停维护并官方推荐迁 Univer；后者维护不活跃、React 优先、Vue 仍在 roadmap。
- **EP + 自研编辑层**：轻量表单正解，但做到框选 / 填充 / 撤销时等于自研一套小 vxe，故不进对比。

## 四、能力矩阵（能否实现 + 实现难易）

**记号**：⬤ 插件原生｜◐ 插件给壳、逻辑我们写（已实现）｜○ 插件没有、全自研（**已做出来**）｜◇ 可自研、尚未做｜✕ 架构上做不到（选型红线）。本矩阵是 `⬤◐○◇✕` 标记的**唯一权威源**。

| 能力 | vxe | vtable-sheet | Univer | 说明 / 实现难易 |
| --- | --- | --- | --- | --- |
| **渲染与视图** | | | | |
| 虚拟滚动 | ⬤ | ⬤ | ⬤ | 三套原生 |
| 冻结列 | ⬤ 任意列 | ⬤ 左侧连续 N 列 | ◐ 仅首列 | Univer 多列要改 `xSplit` 且每次重建重算 |
| 多级表头 | ◐ `group` | ◐ 按 `ColumnDefine` 嵌套 `columns` 透传（录入页未实测） | ✕ | Univer 表头即第 1 行数据，架构做不到 |
| 列宽随容器自适应 | ○ 等比换算 | ○ `allocWidths` | ◇ | Univer 要算好再下发，每次重建重算 |
| 列显隐 | ○ | ○ | ◐ 原生隐藏 + 自研面板 | |
| 点表头打开列配置 | ○ `header-cell-click` | ○ `click_cell`（`cellLocation:'columnHeader'`，分组表头只认叶子行） | ○ 点列标整列选中（A1 信号） | 触发机制不同，弹出的抽屉是同一份 `components/bi-column-drawer` |
| 右键菜单 | ○ `GridContextMenu` | ◐ 自带 `context-menu-plugin`，与自绘菜单二选一 | ⬤ | sheet 的菜单是 Canvas 浮层，接了它就吃不到业务动作；工程目前全部自绘 |
| 多 sheet | ✕ | ⬤ `addSheet` / `removeSheet` + 底部页签 | ⬤ | 工程已关页签，按单 sheet 用 |
| 公式栏 / 公式引擎 | ✕ | ◐ 自研 `FormulaEngine` 40+ 函数；跨 sheet 引用、依赖追踪官方标 TODO；配了自定义编辑器即失效 | ⬤ | 录入台必然自定义编辑器 → 实际拿不到公式 |
| 合并单元格 | ○ 自研 | ⬤ `cellMerge` / `mergeCells` | ⬤ | |
| **单元格编辑** | | | | |
| Excel 式键盘流 | ○ `useGridKeys` | ⬤ `keyboardOptions` | ⬤ | vxe 全自研、成本中等 |
| 文本 / 数字编辑器 | ◐ 自研渲染器 | ⬤ `InputEditor` | ⬤ | |
| 日期（日历弹层） | ⬤ `el-date-picker` | ⬤ `DateInputEditor` | ◇ | Univer 纯输入无弹层，体验最差 |
| 单元格内嵌 Vue 组件 | ⬤ slot / cellRender | ✕ | ✕ | Canvas 放不进 DOM 组件 |
| 填充柄 | ○ `useFillHandle` 全自研 | ◐ 原生手柄 + 自研 `fillLinear` | ⬤ | |
| 复制粘贴（Excel TSV 互通） | ○ 自研 TSV + 逐格 `coerce` | ◐ 原生 `copySelected` + 自研粘贴；快捷键在源码里写死，需 capture 拦截 | ⬤ | |
| 单元格换行 / 多行文本 | ◇ | ◇ 引 `TextAreaEditor` 即可 | ⬤ | 不是做不到，是没接 |
| **校验** | | | | |
| 必填 / 长度 / 正则 / 唯一 / 跨列 | ○ | ○ | ○ | 三套都是自研引擎，规则能力对齐 |
| 数字 `min`/`max` | ○ | ○ | ◐ 下发 `requireNumberBetween` | |
| 整数 | ◇ | ○ `rules.integer` | ◇ | 加一条规则即可 |
| 真实日期 | ○ `isRealDate` | ○ `isRealDate` | ◇ | Univer 现只过正则，`2026-02-30` 会通过 |
| 单元格标红 | ○ `cellClassName` | ○ 列 `style` 回调 / `setCellStyle` | ◐ `setBackground` | |
| 悬停看错误原因 | ◇ | ◇ 需自绘气泡 | ◇ 可用批注 / 浮层 | DOM 版半天，Canvas 版 1~2 天 |
| 校验拦截非法值 | 先落值再标红 | **数字列拒写回滚** | 先落值再标红 | 要求「绝不留下非法值」只有 vtable-sheet 现成 |
| **数据与 IO** | | | | |
| 撤销 / 重做 | ○ `useHistory` | ⬤ 工作簿命令栈（工程仍用自研 `useBiHistory` 保三套一致） | ⬤ 命令栈 | |
| 列筛选 | ○ `FilterPanel` | ⬤ 内置 `filter-plugin`（工程用自研抽屉） | ⬤ 原生漏斗 | |
| 排序 | ◐ 原生交互 + 自研排序 | ○ | ⬤ | vxe 开 `remote`，排序由我们算 |
| 全局搜索收窄行集 | ○ | ○ | ◇ | Univer 行集归原生筛选器，要绕开才能收窄 |
| 查找替换 | ○ | ○ | ○ | Univer 的 find-replace preset 是空壳，自研 |
| 列汇总 / 状态栏 | ○ | ○ | ○ 仅选区 | |
| 数据条 | ○ CSS | ○ 单元格样式 | ⬤ `setDataBar` | |
| 导入导出 xlsx | ○ 自研 `xlsx`/`exceljs` | ⬤ 内置插件（xlsx / csv，可导全部 sheet，exceljs 内核）；工程仍走自研 IO 层 | ⬤ | 三套都可用，实现路径不同 |
| 导出保留样式 / 公式 | ✕ | ◇ `formatExcelJSCell` 逐格挂钩子，样式要自己写，公式不导 | ✕ | 只有 Univer Pro 的 `exchange` 是真保真 |
| 列结构模板 | ○ | ○ | ○ | localStorage |
| **外观 / 集成** | | | | |
| 暗色主题跟随 | ⬤ CSS 变量 | ○ 读计算样式转 `TableTheme` | ◐ `toggleDarkMode` + 自研 observer | |
| e2e 断言单元格文字 | ⬤ DOM | ✕ | ✕ | Canvas 断言不到文字 |
| 无障碍（读屏 / 键盘可达） | ◇ 需补 `aria` | ✕ | ✕ | 无语义节点 |
| 移动端触屏录入 | ◇ | ◇ | ◇ | 三套都不合适，要另做 |

**怎么读**：`✕` 决定**能不能用**；`◇` 决定**报多少工时**；`○` 决定**出问题能不能自己改**（都是已写好的代码，不是缺失项）。典型误读：vxe 的填充柄、复制粘贴、键盘流都是 `○`（`useFillHandle` 等），**已经能用**，只是代码归我们；反过来 Univer 的 `⬤` 更多，但换过去等于把已有的 `○` 全部重写。

## 五、范围与规则口径

| 项 | 口径 |
| --- | --- |
| 列类型 | 仅文本 / 数字 / 下拉 / 日期；布尔、附件、公式列、富文本列均不做 |
| 分页 | 不做，大表一律虚拟滚动 |
| 协作 | 不做实时协同、评论、@提醒 |
| 端 | 仅桌面浏览器，不做移动端适配 |

| 类型 | 格式 | 范围 | 其他 |
| --- | --- | --- | --- |
| **文本** | 正则 `pattern` + 自定义文案 | 长度 `minLen ~ maxLen` | 整列唯一 |
| **数字** | 必须是数值 | 闭区间 `min ~ max` | 整数、整列唯一 |
| **下拉** | 必须是选项之一 | — | 选项不可自由输入 |
| **日期** | `YYYY-MM-DD` 且必须真实存在 | 仅跨列比较 | 显示格式可配，存储恒定 |

- 四类型都支持**必填**；空值只判必填，不跑其他规则。
- **跨列规则**四种：`≥` / `≤` / `=` / 参照列非空时必填。文本与日期按字符串比（ISO 字典序即时间序），数字按数值比。
- **唯一性**只比非空值；**存储与显示分离**：日期存 `YYYY-MM-DD`，`dateFormat` 只影响呈现。

## 六、可拓展性、可替换性与迁移成本

| | vxe | vtable-sheet | Univer |
| --- | --- | --- | --- |
| 可拓展性 | **高**：DOM，单元格可插任意 Vue 组件（`slot` / `cellRender`）；渲染器 / 编辑器 / 校验器插槽式替换，新增能力多在业务层，零 Canvas 学习成本 | **中**：列配置纯数据且继承 `ColumnDefine`，加减列便宜；但单元格不能嵌组件，右键 / 错误气泡 / 悬停 / 主题色都要自绘 Canvas 浮层；sheet 层自带 UI 与自绘 UI 互斥，选一套 | **中低**：原生语义最全，但一切走内核命令与整表重写重下发；扩展要懂插件体系；Pro 能力迁出后要自补 |
| 可替换性 | **高**：列即数组、渲染层最薄，迁到另一 DOM 表格基本只换模板与编辑器绑定 | **中**：`SheetData` 同时接受对象数组与二维数组，从裸 VTable 迁入几乎零业务改动；迁回 DOM 表格要重写事件与样式层；重度用公式后会锁死在 A1 语义 | **低**：选区即 A1、列变即整表重写，迁移≈重写数据层；重度依赖公式 / 多 sheet 时 `✕` 项会反向锁死选型 |

- 前提：业务层已收口到 `src/utils/bi-entry.ts` + 各套 hooks，与渲染层解耦，规则引擎不随插件迁移。
- **Univer UI 只有三档，没有「改」**：① 直接用（自带右键菜单 / 工具栏 / 菜单栏）② 配置裁剪（关 `menu` / `toolbar` / `contextMenu`，或按 id 删菜单项）③ 关掉自己画（`@univerjs/ui` + `sheets-ui` 可整体不装，动作转 `executeCommand`）。自带浮层是 React + Tailwind `createPortal` 到 body；官方有 Vue 3 集成文档与 `@univerjs/ui-adapter-vue3`（可把 Vue 组件注册进 Univer UI），但没有组件式 wrapper，仍要手写 mount / dispose，且筛选 / 条件格式面板无法品牌化。要统一外观须重画一套菜单 + 工具栏，工时提前算。
- 迁移成本（以 vxe 渲染层为 1x，业务层可复用）：→ vtable-sheet **1.5x**、→ Univer **3x**（数据层改 A1 语义）。
- 三套并存的真实成本是同一规则写三份；新增能力优先改 `bi-entry.ts`，不要在渲染层各写一套。

## 七、参考来源（核实 2026-11-10）

- VisActor：[VTable-Sheet 入门](https://visactor.io/vtable/guide/sheet/Getting_Started)、[公式](https://visactor.io/vtable/guide/sheet/formula)、[导入导出](https://visactor.io/vtable/guide/sheet/import_export)、[table-export 插件](https://visactor.io/vtable/guide/plugin/table-export)、[风格](https://visactor.io/vtable/guide/sheet/style)
- Univer：[Vue 3 集成](https://docs.univer.ai/guides/sheets/getting-started/integrations/vue)、[Sheet 安装](https://docs.univer.ai/en-US/guides/sheet/getting-started/installation)
- vxe：[企业版插件商店](https://store.vxeui.com/#/pluginList)
- 工程实测：`collect/package.json`、`src/pages/vtable/**`、`src/utils/bi-entry.ts`、`node_modules/@visactor/*/dist/*.min.js` 体积
- **未实时核实**：Univer 1.4.x 相对工程锁定的破坏性变更、vtable-sheet 公式实际覆盖度（官方只写 40+ 未给全表）、vxe 4.x 最新小版本、各「估算」体积
