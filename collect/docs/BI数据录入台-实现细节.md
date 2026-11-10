# BI 数据录入台 —— 实现细节（vxe-table / vtable-sheet / Univer）

> 定位：三套「Excel 式数据录入台」各自怎么实现、差在哪、坑在哪。**选哪套见 `BI数据录入台-选型指南.md`**。
> 范围：列类型只做**文本 / 数字 / 下拉 / 日期**；不做分页；不做协同。

| 实现 | 入口 | 代码位置 |
| --- | --- | --- |
| **vxe 版**（基线） | `/form-excel-data-entry-vxe` | `src/pages/form-enhance/excel-data-entry-vxe/` |
| **vtable-sheet 版** | `/vtable-sheet`（vtable-sheet 数据录入台） | `src/pages/vtable-sheet/components/vt-bi-entry.vue` + `bi-entry/` |
| **Univer 版** | `/data-platform-univer-entry` | `src/pages/data-platform/univer-entry/` |

依赖：`vxe-table@4.22.4`、`@visactor/vtable@1.26.8`、`@visactor/vtable-sheet@1.26.8`、`@univerjs/presets@1.3.0`（Apache-2.0 核心 + 6 个 OSS preset）、`xlsx@0.18.5`、`vue@3.5.13`、`element-plus@2.10.5`、`react@19`（Univer 内部依赖）。

## 1. 三套是什么

| 维度 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 渲染内核 | DOM（vxe-table + 自定义单元格渲染器） | Canvas（`VTableSheet` 容器 + 底层 `ListTable` 自绘） | Canvas（Univer 自绘，内部用 React） |
| 数据真相源 | `Row[]` 行对象数组 | `BiRow[]` 行对象数组（`SheetData` 支持对象数组，无需转二维矩阵） | **工作表二维单元格矩阵**（无行对象） |
| 行主键 | `__id`（稳定，删行不变） | `rowId`（稳定） | 无（行号即位置） |
| 脏标记 | `row.__dirty` | `row.changed` | 基线快照逐格签名比对 |
| 撤销 | 自研 `useHistory` 快照栈 | 自研 `useBiHistory` 快照栈（sheet 自带命令栈已关） | Univer 命令栈（`api.undo()`） |
| 规模 | 约 6.6k 行 / 38 文件 | 约 4.5k 行 / 9 文件 | 约 3.4k 行 / 15 文件 |

- **vxe 版**：表格骨架（渲染、虚拟滚动、冻结、编辑器、合并、右键）由 vxe 提供，填充柄、复制粘贴、键盘流、校验、列模型、查询、IO、撤销全在 `hooks/` 自研，可调试性最好。
- **vtable-sheet 版**：证明 Canvas 大表性能，顺带拿到 sheet 层的合并 / 多 sheet / 公式栏语义，但**这些自带能力全部关掉换自绘**，实际只用它当「带工作表外壳的 ListTable」。
- **Univer 版**：把表格语义交给内核（虚拟滚动、选区、复制粘贴、填充柄、撤销、筛选、排序、数据验证、条件格式），自研只做业务层（列定义、校验规则、提交、导入导出、模板）。

### 1.1 三套共享代码层

空值判定、数值转换、日期归一、行签名、跨列规则这些「三套共用、口径必须一致」的纯函数，
统一放在 `src/utils/bi-entry.ts`（导出 `ColType` / `ColRule` / `CrossRule` / `BiColLike` 等类型，
以及 `isBlank` / `numOf` / `round2` / `renderDate` / `normalizeDate` / `emptyValueFor` /
`cloneRows` / `rowSignature` / `rowIsEmpty` / `crossError`）。

三套的 `schema.ts`（vtable-sheet / Univer）与 vxe 的 `types.ts` 只做转发，对外暴露的类型名与语义不变；
改口径只改一处，避免数字列空值 `null` 还是空串这类差异在三处各自漂移。

## 2. 能力差异

> 边界：**能否实现 / 实现难易的权威标记（⬤◐○◇✕）以 `BI数据录入台-选型指南.md` 第四章为准**，本章只列三套的**实现机制差异**（用哪个编辑器 / 哪个 API / 什么时序），不重复打标记，避免两处漂移。

只列**有差异或带实现细节**的。三套一致的部分不逐条列：行操作（新增 / 插入 / 删除 / 复制 / 清空 / 删空行 / 去重）、列操作（增删改、改类型与选项、必填标记、列宽、移序、localStorage 列模板）都已实现。

### 2.1 视图与结构

| 能力 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 虚拟滚动 | 原生 `scroll-y`，自研只算高度 | 原生（底层 `ListTable`） | 原生 |
| 分页视图 | `viewMode: virtual / paged` | `el-pagination` + 切页后 `setRecords(displayRows)`（不走 `updatePagination`） | 无（需求边界：不做） |
| 冻结列 | 任意列 `frozen` | `frozenColCount`（左侧连续 N 列），经 sheet 定义下发 | 仅首列（`xSplit: 1`） |
| 多级表头 | `ColDef.group` 聚合父表头 | `columns` 嵌套透传（`IColumnDefine` 继承 `ColumnDefine`） | 无，表头即第 1 行 |
| 列宽 | 按容器宽等比换算 + 拖拽 | 列配置显式宽（`allocWidths` 分配） | 基准 px 下发 + 拖拽 |
| 列移序 | `moveCol` | `onMoveCol` | `moveColumn`（整表重写） |
| 合并单元格 | 框选合并 / 一键全取消 | 运行时 `mergeCells` / `unmergeCells`，且每次重建要用 `cellMerge` 配置态重放 | `FRange.merge` / `breakApart`，限数据区 |
| 右键菜单 | 自研 `GridContextMenu` | 自研（已禁用 sheet 自带 `context-menu-plugin`，不再双弹） | 原生 |
| 多 sheet | 无 | sheet 层原生，本页 `showSheetTab: false` 不用 | 原生 |
| 点表头打开列配置 | `header-cell-click` | `click_cell`（`cellLocation:'columnHeader'`，分组表头只认叶子行） | 点列标整列选中（A1 信号） |

行操作的唯一差异是**插入方向**：vxe 上方、vtable-sheet 下方、Univer 上方。

### 2.2 单元格编辑

| 能力 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 直接键入进编辑 | 自研 `useGridKeys` | `keyboardOptions` 单字符键（经 sheet 定义透传给底层） | 原生 |
| 文本 / 数字编辑器 | 自研渲染器 | `InputEditor` | 原生 |
| 下拉 | `SelectEditor` | `ListEditor` | LIST 规则 + `renderMode: TEXT`：静态只画文本、无箭头，**点中格**才弹原生列表（见 §4.2） |
| 日期 | `DateEditor`（日历弹层） | `DateInputEditor` | 无弹层、无 `dateFormat`，只认 `YYYY-MM-DD` |
| 换行 / 富文本 | 无 | 无（文本列单行 `InputEditor`，未引入 `TextAreaEditor`） | 原生 |
| 复制粘贴 | 自研 TSV 解析 | sheet 源码写死 `copySelected` / `pasteValueToCell` / `cutSelected`，改配置压不住 → capture 阶段 `stopPropagation` 让自研 TSV 独占 | 原生 |
| 填充柄 | 自研 `useFillHandle`（数字等差 / 日期按天） | 原生手柄 + `mousedown_fill_handle` / `drag_fill_handle_end` → 自研 `fillLinear` 算值 | 原生 |
| 蚂蚁线 | 自研 `useCopyMarquee` 流动动画 | sheet 强制开的 `showCopyCellBorder` 静态框 | 原生 |

### 2.3 校验

| 能力 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 下拉值域 | 编辑器约束 | `ListEditor` | LIST 规则只承载选项、**不拦写**（`showErrorMessage: false`）；不在选项内的值照常写入，红框由自研层标出 |
| 数字 min / max | 自研 | 自研 | 同步下发 `requireNumberBetween`（不拦写，见 4.1 ①） |
| 数字必须整数 | `rules.integer` | `rules.integer` | `rules.integer` |
| 日期必须真实 | `isRealDate` | `isRealDate` | 只过正则，`2026-02-30` 会通过 |
| 整列唯一 | 自研 | 自研 | 预建索引，O(n) |
| 跨列规则 | `gte / lte / eq / requiredIf` | 同 | 同 |
| 错误标红 | `cellClassName` | 列 `style` 回调实时校验 | `setBackground` + `setFontColor` |
| 校验触发时机 | 变更后整表复检 | 编辑即校验（不进热路径） | `revision` 去抖 260ms；≤3000 行整表复检，超限只在提交 / 结构变更时扫 |
| 校验面板 + 定位 | 自研 | 自研 | 自研 |
| 提交两段校验 | 本地 → mock 服务端 | 同 | 同 |

### 2.4 查询

| 能力 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 列筛选 | 自研 `FilterPanel` | 筛选抽屉 + 条件组合 | 原生列头漏斗 |
| 排序 | 自研（`remote: true`） | 自研 | 原生 |
| 查询条件可视化 | `GridQueryChips` | 条件列表 | 原生漏斗浮层 |
| 全局搜索 | 收窄行集 | 收窄行集 | 标黄 + 命中计数，不收窄 |
| 查找替换 | 自研 | 自研 | 自研（整表快照扫描） |

大小写 / 整格匹配、上一个下一个循环、全部替换三套都有。Univer 全局搜索只标黄的原因：行集归原生筛选器管，搜索框再收窄会和漏斗打架；真要收窄走列头漏斗。

### 2.5 汇总、导入导出、撤销

| 能力 | vxe 版 | vtable-sheet 版 | Univer 版 |
| --- | --- | --- | --- |
| 列汇总条 | 自研 `aggregate` | 列汇总 + 状态栏 | 只有状态栏选区统计（count / sum / avg / max / min） |
| 数值列数据条 | 自研 | 自研 | `setDataBar` |
| 导入 Excel | `xlsx` / `exceljs` + 日期序列号还原 | 同（sheet 自带的 `excel-import-plugin` 未接，保持三套同一份 IO） | 同（`XLSX.SSF.parse_date_code`） |
| 导出 | Excel（全部 / 当前结果）+ CSV，不保留样式 | 同（未用 `table-export-plugin`） | 同（排除筛选隐藏行） |
| 撤销 | 自研快照（含列结构） | 自研快照（含列结构） | 命令栈；列操作是整表重写，撤销后需重下发格式 |
| 数据草稿 | 无 | `saveDraft` / `resetDraft` | 无 |
| 压测数据 | 1k / 1w / 5w / **10w** | 有 | 500 / 1k / 5k / 1w |
| F1 帮助 | 全套自研 `useGridKeys` | 部分 | 本站接管 `Ctrl+F` / `F1`，其余用原生 |

## 3. 数据模型差异（决定实现方式的三条）

### 3.1 有没有「行对象」

- **vxe / vtable-sheet**：`Row = { __id, __dirty, name, age, ... }`，数组就是真相源，改一格等于改对象的一个属性。vtable-sheet 的 `SheetData` 同时接受对象数组与二维矩阵，本页走对象数组，行对象语义与 vxe 完全一致。`ListTable` → `VTableSheet` 迁移业务层零改动的原因见选型指南 §二。
- **Univer**：**没有行对象**，工作表是二维矩阵。`readRecords(defs)` 每次从区间 `getValues()` 现拼 `EntryRecord[]`：

  ```ts
  const HEADER_ROW = 0;
  toSheetRow = (i) => i + HEADER_ROW + 1;   // 数据下标 → 工作表行号
  toDataIndex = (r) => r - HEADER_ROW - 1;  // 工作表行号 → 数据下标
  ```

**存档形状**（`IWorkbookData`，即 `save()` 返回值、也是持久化单元）：三层字典，一路按坐标查下去。

| 层 | 关键字段 | 说明 |
| --- | --- | --- |
| Workbook | `sheetOrder` / `sheets` / `styles` | 工作表顺序单独存数组，不靠 key 顺序；`styles` 是工作簿级样式池 |
| Worksheet | `rowCount` / `columnCount` / `cellData` / `styles` / `mergeData` / `rowData` / `columnData` / `freeze` | 一张表的全部内容；后四项都是「挂在具体行号/列号区间上」的配置 |
| Cell | `v` / `t` / `f` / `s` / `p` | 见下 |

- `cellData` 形如 `{ [行号]: { [列号]: ICellData } }`，**稀疏**——只存有值的格子，`rowCount` 范围内的空行不占空间。
- `ICellData` 只有五个字段：`v` 值（`string | number | boolean`）、`t` 类型枚举（`1` STRING / `2` NUMBER / `3` BOOLEAN / `4` FORCE_STRING）、`f` 公式串、`s` 样式（样式池 id 或内联 `IStyleData`）、`p` 富文本。**没有行 id，没有任何行引用。**
- `rowData` / `columnData` 是**覆盖**不是定义：只存与 `defaultRowHeight` / `defaultColumnWidth` 不同的行列，字段只有 `h`（行高）/ `w`（列宽，像素）/ `hd`（隐藏）。
- 于是「行」「列」都不是实体：`cellData[3]` 是「所有行号为 3 的格子」，删第 1 行等于所有下行键整体 -1。**列同理——`columnData` 只有宽和隐藏，没有列名、没有列类型**，所以「姓名是文本列、年龄是数字列」这类业务定义在 Univer 里不存在，必须自建 `ColDef[] → 列索引` 映射。这是 §6.2 `caps` 与 §3.3「结构变更必须全量重写」的共同根因。
- 这份存档是**只读视图**：直接改对象画布不响应，写入只能发命令（`setValue` / `executeCommand` / `moveColumn`）。

### 3.2 脏标记

| 做法 | 写在哪 | 代价 |
| --- | --- | --- |
| `row.__dirty = true`（vxe） | 行对象字段，编辑时顺手置位 | 无 |
| `row.changed = true`（vtable-sheet） | 同上 | 无 |
| 基线快照比对（Univer） | `baseline: string[]`，`signatureOf()` 用 `\u0001` 连接各列；5k 行 × 8 列约 40k 次拼接，实测可接受 | 每次刷新 O(行×列) |

Univer 只能这么做：没有行对象可挂标记，编辑走 command 拿不到「哪一行被改」（`onCommandExecuted` 只告诉你「有命令执行了」）。副作用是**改回原值后脏标记会自动消失**，比布尔标记更准。

### 3.3 结构变更的代价

| 操作 | 有行对象 | 无行对象（Univer） |
| --- | --- | --- |
| 加 / 删 / 移序一列 | 改 `defs`，行对象不动，O(列) | 读整表 → 改每行 → 整块 `setValues`，O(行×列) |
| 因此 | 结构操作很便宜 | 必须「全量重写」而非增量命令，且每次都要调 `applyChrome()`（见 4.1 ②） |

## 4. Univer 版实现地图

```
src/pages/data-platform/univer-entry/
├── univer-entry.vue       # 装配层：串联 hooks、脏行统计、选区统计、主题跟随、快捷键
├── schema.ts              # 数据契约：ColType / ColRule / CrossRule / ColDef / EntryRecord、行号换算
├── univer-types.ts        # Facade 最小类型面（node10 解析不了 exports 子路径）
├── univer-locales.d.ts    # 6 个语言包模块声明
├── useEntrySheet.ts       # 网格读写通道：读写记录、列宽/显隐/验证/条件格式/冻结、合并、去抖、选区订阅、undo
├── useEntryRules.ts       # 校验引擎：整表扫描（unique 预建索引）、标红、清除、定位
├── useEntryOps.ts         # 行/列/批量/模板/提交：全部结构操作走「读 → 改 → 写」
├── useEntryIO.ts          # 导入导出：xlsx 读、日期序列号还原、导出排除隐藏行
├── useEntryFind.ts        # 查找替换 + 全局搜索（去抖 220ms）
└── components/            # EntryToolbar / ColumnDrawer / ErrorDrawer / FillDialog / FindBar / HelpDialog
```

三层分工：内核管表格语义；`schema.ts` 是唯一数据契约（列类型派生显示/编辑/校验，无硬编码字段名）；hooks 只做业务，UI 组件不含业务判断。

### 4.1 四条关键取舍

**① 数据验证只承载「选项 / 区间」，不拦写** —— `applyDataValidation` 把下拉编译成 `requireValueInList`、数字 `min/max` 编译成 `requireNumberBetween`，两者都只 `setAllowBlank(true)`，**不设 `errorStyle: STOP`**。Univer 的写值拦截判定是「`showErrorMessage !== false` 且 `errorStyle === STOP`」，不设 `STOP` 就一律放行。

本页不设 `STOP`，所以两类规则都不拦写：非法值照常写入，红框与提交拦截统一由自研校验层负责。理由是三套口径要一致（vxe / vtable-sheet 都是先落值再标红），且同一种「值不对」不该同时出现「原生弹框 + 红框」两种提示。

自研校验层负责必填、长度、正则、唯一、跨列，以及下拉的「必须是选项之一」、数字的区间。

**② 任何结构变更后必须重下发「外观与约束」** —— 数据验证、条件格式、列宽、冻结全挂在具体列区间上，列一删一挪就错位。所以每次结构变更都走一遍：

```ts
const applyChrome = () => {
  sheetApi.writeHeader(defs.value);            // 表头（含必填 *）
  sheetApi.applyColumnWidths(defs.value);      // 列宽
  sheetApi.applyColumnVisibility(defs.value);  // 显隐
  sheetApi.applyDataValidation(defs.value);    // 下拉 / 数字区间
  sheetApi.applyDataBars(defs.value, conditionalOn.value);
  sheetApi.applyFreeze(freezeFirst.value);
};
```

漏任何一步都是**静默失效**：不报错，但下拉不弹、数据条不显示、错误不标红。

**③ 校验不做「编辑即校验」** —— Univer 只有 `onCommandExecuted`，没有单元格级事件。所以：任意命令 → `bumpRevision()`（去抖 260ms）→ `watch(revision)` → `validateAndMark()`。超过 3000 行跳过自动复检，只在提交 / 结构变更 / 手动触发时全表扫。

**④ 查找替换不用 `FTextFinder`** —— 本 preset 组合下失效（搜索恒返回 0），改为 `getValues()` 读全表内存扫描、命中用 A1 表达，行为完全可预期。

### 4.2 下拉列：静态纯文本，点中才弹

下拉列在画面上与文本列**完全一致**——没有右侧常驻箭头、没有彩色 chip。只有点中某一格才弹出选项列表，选完即收起。三个环节各管一段，任一处错都会退回「整列挂箭头」或「点了不弹」：

| 环节 | 做法 | 关键点 |
| --- | --- | --- |
| 静态渲染 | 规则里 `setOptions({ renderMode: DataValidationRenderMode.TEXT })` | 枚举是**数值**（`TEXT=0` / `ARROW=1` / `CUSTOM=2`）；传字符串 `'TEXT'` 静默忽略、箭头照旧。不传等同 `CUSTOM` |
| 弹出 | 点中格 → `executeCommand('sheet.operation.show-data-validation-dropdown', { unitId, subUnitId, row, column })` | 命令不检查 `renderMode`、不要求进编辑态；同一格重复下发幂等（handler 先比对当前弹层位置，不会闪一下再开） |
| 弹层形态 | preset 参数 `{ showEditOnDropdown: false, showSearchOnDropdown: false }` | 底部「编辑」会打开 Univer 自带的数据验证侧边栏，与页面的列配置抽屉形成两份真相源；搜索框是 `autoFocus`，会抢走键盘焦点，把「直接打字改值」变成「筛选选项」 |

「点中格」的判定不用 Univer 事件：`CellClicked` 在本页收不到（见 §8），改由容器 `pointerdown` + window `pointerup` 判位移（≤4px 视为点击），再读 `getActiveCell()`。因此拖选一片区域、拖填充柄、点表头都不会弹。

实际交互：点中 → 列表在单元格下方展开（当前值打勾）→ 选中后 Univer 直接写值并收起；点别处同样收起。列表没有「清空」入口，清空走键盘 Delete。不在选项内的值可以直接键入，由行级校验标红（见 4.1 ①）。

## 5. 还没做的

| 方向 | 说明 |
| --- | --- |
| 服务端校验 schema 化 | 现在 `serverValidate` 是 mock，应改成后端下发规则 DSL，前端编译成 `ColRule[]` + 数据验证。**三套共同缺口** |
| 字典远程加载 + 联动下拉 | `options` 现在是静态数组，省市二级联动、物料编码需要异步字典 |
| 单元格级权限 | 只读列（系统算出的编号）、脱敏列（打码显示但保留真值参与校验与提交） |
| 审计留痕 | Univer 所有变更走 command，可记「谁、何时、改了哪格、旧值→新值」 |
| 超大表分片 | `SHEET_ROW_COUNT = 20000` 是当前上限，超了要分片加载或按业务拆 sheet |
| 模板与列定义入库 | 现在 `localStorage`，换机器就没了，应随租户存后端 |
| 计算列 / 公式列 | Univer 内置 500+ 函数（`FRange.setFormula`）；vxe 做同等能力等于自己写公式引擎 |
| 多 sheet / 跨表引用 | `createWorkbook` 已支持，需扩 `buildWorkbookData` |
| 条件格式补齐 | 色阶、图标集、公式规则：`UCfBuilder` 扩 `setColorScale` / `setIconSet` |
| **Pro 才能做** | 透视表、图表、`exchange`（保样式导入导出）、打印 PDF、协作。`@univerjs/preset-sheets-advanced` 会带进 28 个 `@univerjs-pro/*`，纯开源不能装 |

## 6. 列配置交互（三套共用一份 UI）

单列配置的界面**只有一份**：`src/components/bi-column-drawer/`。三套录入台只做「列定义 ⇄ 草稿」的映射（入参类型就是 `utils/bi-entry.ts` 的 `BiColLike`），不再各写一份，否则立刻漂移成三种观感。

### 6.1 交互规格（改这里等于改三套）

| 项 | 规格 |
| --- | --- |
| 容器 | 右侧 `el-drawer`，宽 440px，挂 `.bi-dlg` 继承 `--bi-*` 色板（含暗黑） |
| 标题 | `列配置 · <列名>`，列名取打开时快照，输入时不跟着抖 |
| 提交 | 草稿模式：改动先落本地，**确定**才整体回写；取消 / 遮罩 / Esc / × 一律丢弃 |
| 分区顺序 | 基本信息 → 类型专属（下拉选项 / 数值范围 / 日期格式）→ 校验规则 → 跨列规则 → 列状态（+ 列宽 / 表头分组）→ 删除该列 |
| 必填校验 | 列名非空；下拉列至少一个非空选项。空规则由 `compactRules` 裁掉，不留 `rules: {}` 空壳 |

两个入口分工固定，三套一致：

- **列设置**（工具栏）：全量列表，只做增删 / 移序 / 显隐 / 冻结，改动即时生效；
- **列配置**（点列头，或列设置列表里的「配置」）：单列，走上面的共享抽屉。

### 6.2 引擎能力开关

能力差异靠 `caps` 控制显隐，不做「按钮在、点了没反应」的假统一：

| caps | vxe | vtable-sheet | Univer | 原因 |
| --- | --- | --- | --- | --- |
| `frozen` | ✅ | ✅ | — | Univer 只支持冻结首列（`xSplit`），不是任意列 |
| `group` | ✅ | ✅ | — | Univer 无多级表头，表头即第 1 行 |
| `width` | — | — | ✅ | vxe 按容器等比换算 + 拖拽；vtable-sheet 的 `width` 是等比基准不是像素 |

其余项（列名 / 类型 / 必填 / 显示 / 选项 / 日期格式 / 数值区间 / 整数 / 长度 / 正则 / 唯一 / 跨列规则 / 删除）三套完全一致。

## 7. 样式与主题一致性

色板唯一来源是 `assets/style/bi-entry.less` 的 `--bi-*`，三套别名 `--dt-*`（vxe）/ `--ue-*`（Univer）/ `--el-*`（vtable-sheet）都映射到它；改一处三处生效。

- **vxe**：原生 CSS 变量，经 `:deep()` 覆写 `.vxe-*`；行悬停、表头图标 hover 显隐、跨列十字高亮、选区/错误/查找高亮都挂在 `--bi-*`。
- **vtable-sheet**：`buildTableTheme()` 建表时 `getComputedStyle` 读 `--bi-*` 转 `TableTheme`，按 sheet 的入参形状包一层 `theme: { tableTheme }`（不是裸 `theme`）；行悬停（`defaultStyle.hover`）、选区双向淡色底（`select` + `selectionStyle`）、滚动条与排序图标品牌色全部取自 `--bi-*`。暗黑切换靠 `watch(themeStore.isDark)` → `rebuild()` 重建主题。默认行高用 sheet 的 `defaultRowHeight: 32` 对齐 vxe 的密排观感。
- **Univer**：`setDark()` = **恒喂亮色基调主题** + `toggleDarkMode(dark)`。Univer 暗色靠**反色矩阵**实现，「暗色主题 + 暗黑开关」会把已暗颜色翻白、画布发白（本仓踩过两次）；正确组合只有「亮色主题 + 开关」。主题色必须填**主题键路径**（如 `orange.400`），填十六进制会解析成 `theme["#ff8f1f"]` → undefined；写进单元格的颜色恒写亮色值参与统一反转；`setTheme` 整体替换不合并，必须全量透传 `defaultTheme`。

### 7.1 单元格样式：白名单，不是任意 CSS

改单元格样式走 `range.setStyle({...})`，或语义化语法糖（`setFontWeight` / `setBackgroundColor` / `setHorizontalAlignment` 等）。改动进样式池、进撤销栈。**能改的是 `IStyleData` 白名单，不是 CSS 属性表**：

| 能做 | 字段 |
| --- | --- |
| 字重 / 斜体 / 下划线 / 删除线 | `bl` / `it` / `ul` / `st` |
| 字号 / 字体 / 字色 / 背景色 | `fs` / `ff` / `fc` / `bg` |
| 边框 | `bd` |
| 水平 / 垂直对齐 / 换行 / 文字旋转 | `ht` / `vt` / `tb` / `tr` |
| 数字格式（千分位 / 百分比 / 日期） | `n` |

做不到：`box-shadow`、`letter-spacing`、行内 padding、渐变、圆角。这是 Excel 的样式模型，不是 CSS 模型——要「圆角高亮块」「左侧强调条」这类效果，只能靠单元格底色 + 边框近似，或放弃单元格、改用外层自绘。

两条实务约束：

- **颜色参与反色**：`#ffffff` 在白底上是白，切暗黑被反色矩阵翻转成黑；同一色值在两种主题下不是同一视觉结果（见上文 Univer 段）。
- **批量刷样式会污染撤销栈**：一次 `setStyle` 一条命令，刷 100 格 = 100 步 `Ctrl+Z`。程序化批量设置要么包成单个命令批次，要么设置完清空撤销栈。

## 8. 踩坑清单

**vxe**
- 列宽只认 px，百分比宽会被截断，`fit` 不要用；列宽按容器等比换算，容器尺寸变化要自己重算。
- 文本类校验发生在值已写入之后，要拦非法值在 `edit-closed` 里 reject。
- 表头排序/筛选图标默认隐藏，hover 列头或该列激活时才显示。透明度必须压在图标元素（`.vxe-sort--asc-btn` 等）上，不能压在 `.vxe-cell--sort` 容器上——父级 `opacity:0` 会把子级一起裁掉；激活态类名是 `.sort--active`（图标上）与 `.is--filter-active`（th 上），写成 `.is-active` 会静默失效。

**vtable-sheet**
- **自带 UI 必须四件全关**：`mainMenu` / `showFormulaBar` / `showSheetTab` / `undoRedo`。漏一个就是两套工具栏或两套撤销栈并存的观感事故。关的是 UI，不是能力 —— `undoRedo: { show: false }` 之后快捷键是否还生效取决于插件监听位置，仍要在 capture 阶段自行截断。
- **复制粘贴快捷键改不掉**：sheet 源码里强制开 `copySelected` / `pasteValueToCell` / `cutSelected`，透传配置无效，一次 `Ctrl+V` 会写两遍。解法只有 `keydown` 用 capture 监听并对 `c/v/x/z/y/d/r/f/h` 调 `stopPropagation`，由自研实现独占。
- **`excelOptions` 会被整体替换**为 `{ fillHandle: true }`，其余字段传进去不生效；填充柄相关的自定义只能走事件（`mousedown_fill_handle` / `drag_fill_handle_end` / `dblclick_fill_handle`）。
- **合并是「配置态 + 运行时」双份**：运行时 `mergeCells` 只改当前画布，重建（改列、切主题、恢复撤销）后必须用 `cellMerge` 重新下发，否则合并块全丢。
- **`release()` 会连带释放底层 `tableInstance`**，再单独 `table.release()` 就是重复释放。
- **类型上要交叉声明**：`ISheetDefine` 只声明工作表语义字段，实际是 `Object.assign({}, sheetOptions, {...})` 整包丢给 `ListTable`。想透传 `keyboardOptions` / `eventOptions` 这类底层选项，类型要写 `ISheetDefine & Omit<ListTableConstructorOptions, keyof ISheetDefine | 'records' | 'container'>`。
- **高度依赖自建根节点**：`.vtable-sheet-container` 要显式撑满外层面板（`:deep` 里给 `height: 100%`），否则内容区高度塌陷成 0，且不报错。
- **右键菜单双弹**：sheet 自带 `context-menu-plugin` 会与自绘菜单同时弹出。解决：把 `@visactor/vtable-plugins` 作为直接依赖，构造时传 `VTablePluginModules: [{ module: ContextMenuPlugin, disabled: true }]` 禁用该插件；右键改由 `contextmenu_cell` 事件 + `eventOptions.preventDefaultContextMenu` 接管。
- **公式与自定义编辑器互斥**：手动配置单元格编辑器后，sheet 的公式能力会被禁用。录入台必然自定义编辑器，所以别指望在这一套里同时拿到公式。

底层 `ListTable`（迁移前就有、仍然成立）：
- 在隐藏的 tab 里初始化会拿到 0 宽，列宽退化成保底值（右边缘留空）。必须容器可见后 `resize()`，宽度差 >4px 就重建。
- 单元格样式回调 `StylePropertyFunctionArg` 里没有 `field`，要用 `col` 索引回查。
- 内置编辑器只有 4 种，没有 NumberEditor，数值校验自己写。
- 切 tab 时控制台可能冒 `ListTableAll.getElement` null（ResizeObserver 与 `rebuild()` 竞态），不阻断渲染。

**Univer**
- 表头就是第 1 行，没有独立列元数据；列宽、校验、条件格式全挂在「具体列区间」上，删列挪列即失效。
- 任何结构变更都要整轮重下发，漏一步静默失效（见 4.1 ②）。
- 实例**不能进 `ref` / `reactive`**，Vue Proxy 会打破内部依赖收集；用普通变量 + `shallowRef`。
- `moduleResolution: "Node"` 解析不到 `@univerjs/*` 的 exports 子路径，靠 `univer-types.ts` + `univer-locales.d.ts` 垫片，**升级时必须复核这两个文件**。
- 画布容器必须有确定尺寸，放在 `display: none` 里初始化会得 0 尺寸且不报错。
- 格式操作会进撤销栈（`setBackground` 也是 command），查找标黄能被 `Ctrl+Z` 撤销。
- `merge()` 只保留左上角值，会吞数据；已挡掉表头行与跨表头边界。
- 粘贴越界不拦，数据写进没有定义的列后 `readRecords` 读不回来 —— 静默丢数据。
- `SHEET_ROW_COUNT` / `SHEET_COLUMN_COUNT` 是建表一次性尺寸（当前 20000 × 60），改大要重建工作簿。
- React 是硬依赖（`react@19` + `react-dom@19`），`UniverSheetsCorePreset` 内部用 React 渲染弹层。
- 点列标后**整列选中的 A1 是简写 `E:E`**（不是 `E1:E20000`），只认全量格式的正则永不命中、抽屉打不开；列索引按字母自算，别依赖 `getRange` 解析简写。
- 数据验证的 `renderMode` 是**数值枚举**（`DataValidationRenderMode`：`TEXT=0` / `ARROW=1` / `CUSTOM=2`）。传字符串 `'TEXT'` 不报错也不生效，箭头照旧；不传等同 `CUSTOM`。要「静态只有文本」必须传枚举值。
- `requireValueInList(values, multiple, showDropdown)` 的 `showDropdown` **只存不渲染**——箭头画不画由 `renderMode` 决定，传 `false` 也没用。
- `setOptions({ showErrorMessage: true, error })` **不等于拦写**：拦截条件是 `errorStyle === DataValidationErrorStyle.STOP`（`STOP=1`），未设 `errorStyle` 时按「允许非法值」放行，连错误框都不弹（`getAllowInvalid()` 的判定同样是 `errorStyle !== STOP`）。要真拒写必须显式写 `errorStyle: DataValidationErrorStyle.STOP`。
- 原生下拉只能主动弹：`sheet.operation.show-data-validation-dropdown`，参数 `{ unitId, subUnitId, row, column }`。不检查 `renderMode`、不要求编辑态；该格必须挂着 LIST 规则，否则命令成功但没东西可弹。
- `CellClicked` 事件在本页**收不到**（sheets-ui 的 `FUniver._initObserverListener` 要等「出现 sheet + Lifecycle ≥ Rendered」才订阅 `HoverManagerService.currentClickedCell$`；DOM 的 pointerdown / click 确实都落在 canvas 上，回调不触发）。要「点中某格」只能自己判指针；上报坐标时读 `getActiveCell()`、**不要读 `selection` ref**——选区快照要到 click 阶段才刷新，`pointerup` 里读 ref 是 null（实测），活动格在 `pointerdown` 时已经落到文档模型里。同步上报还有个前提：双击的 `dblclick` 回调要立刻拿到坐标。
- 文本型数字的左上角会出现 **6px 绿三角**（`#409f11`），是 `ForceStringRenderController` 的 `FORCE_STRING_MARK`，只表示「这格存的是文本」，不是校验错误，与自研红框互不影响。触发条件：单元格类型为 `STRING` / `FORCE_STRING`、值能当数字（含 `20%` / `1,234.56`）、且数字格式不是「文本」。要关掉走 `sheets-ui.config` 的 `disableForceStringMark: true`；更该做的是按语义写数字 / 日期，否则求和与排序都会失效。
- Univer 的浮层/Tailwind 全用 `rem`，**根字号一变（本仓大屏模板 `:root{font-size:calc(100vh/10.8)}` 顶到 ~78px）所有间距尺寸放大 ~4.88 倍**，只压 `font-size` 会得到「字小了框还巨大」。进本页时把根字号恢复 16px，离开移除。
- 内置浮层（右键菜单 / 下拉 / 筛选面板）由 React `createPortal` 挂到 `body`，跨出 scoped 与 CSS 变量作用域。**真锚点是 `.univer-popup`**（弹层是 body 下的 `<section class="univer-popup univer-fixed">`）；`#univer-popup-portal-*` 是空容器（0 子节点），按它写选择器全是死代码。
