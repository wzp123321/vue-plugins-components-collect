# BI 数据录入台 —— 实现细节（vxe-table / VTable / Univer）

> 定位：三套「Excel 式数据录入台」各自怎么实现、差在哪、坑在哪。**选哪套见 `BI数据录入台-选型指南.md`**。
> 范围：列类型只做**文本 / 数字 / 下拉 / 日期**；不做分页；不做协同。

| 实现 | 入口 | 代码位置 |
| --- | --- | --- |
| **vxe 版**（基线） | `/form-excel-data-entry-vxe` | `src/pages/form-enhance/excel-data-entry-vxe/` |
| **VTable 版** | `/vtable` → 「BI 数据录入」 | `src/pages/vtable/components/vt-bi-entry.vue` + `bi-entry/` |
| **Univer 版** | `/data-platform-univer-entry` | `src/pages/data-platform/univer-entry/` |

依赖：`vxe-table@4.22.4`、`@visactor/vtable@1.26.8`、`@univerjs/presets@1.3.0`（Apache-2.0 核心 + 6 个 OSS preset）、`xlsx@0.18.5`、`vue@3.5.13`、`element-plus@2.10.5`、`react@19`（Univer 内部依赖）。

## 1. 三套是什么

| 维度 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 渲染内核 | DOM（vxe-table + 自定义单元格渲染器） | Canvas（VTable 自绘） | Canvas（Univer 自绘，内部用 React） |
| 数据真相源 | `Row[]` 行对象数组 | `BiRow[]` 行对象数组 | **工作表二维单元格矩阵**（无行对象） |
| 行主键 | `__id`（稳定，删行不变） | `rowId`（稳定） | 无（行号即位置） |
| 脏标记 | `row.__dirty` | `row.changed` | 基线快照逐格签名比对 |
| 撤销 | 自研 `useHistory` 快照栈 | 自研 `useBiHistory` 快照栈 | Univer 命令栈（`api.undo()`） |
| 规模 | 约 6.6k 行 / 38 文件 | 约 4.5k 行 / 8 文件 | 约 3.4k 行 / 15 文件 |

- **vxe 版**：表格骨架（渲染、虚拟滚动、冻结、编辑器、合并、右键）由 vxe 提供，填充柄、复制粘贴、键盘流、校验、列模型、查询、IO、撤销全在 `hooks/` 自研，可调试性最好。
- **VTable 版**：证明 Canvas 大表性能，但编辑 / 校验 / 填充仍需大量自研补齐。
- **Univer 版**：把表格语义交给内核（虚拟滚动、选区、复制粘贴、填充柄、撤销、筛选、排序、数据验证、条件格式），自研只做业务层（列定义、校验规则、提交、导入导出、模板）。

## 2. 能力差异

只列**有差异或带实现细节**的。三套一致的部分不逐条列：行操作（新增 / 插入 / 删除 / 复制 / 清空 / 删空行 / 去重）、列操作（增删改、改类型与选项、必填标记、列宽、移序、localStorage 列模板）都已实现。某项是插件给的还是我们写的，见选型指南第四章。

### 2.1 视图与结构

| 能力 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 虚拟滚动 | 原生 `scroll-y`，自研只算高度 | 原生 | 原生 |
| 分页视图 | `viewMode: virtual / paged` | `el-pagination` + `updatePagination` | 无（需求边界：不做） |
| 冻结列 | 任意列 `frozen` | `frozenColCount`（左侧连续 N 列） | 仅首列（`xSplit: 1`） |
| 多级表头 | `ColDef.group` 聚合父表头 | `groupColumns` + 列 `group` | 无，表头即第 1 行 |
| 列宽 | 按容器宽等比换算 + 拖拽 | 列配置显式宽（`allocWidths` 分配） | 基准 px 下发 + 拖拽 |
| 列移序 | `moveCol` | `onMoveCol` | `moveColumn`（整表重写） |
| 合并单元格 | 框选合并 / 一键全取消 | `mergeCells` / `unmergeCells` | `FRange.merge` / `breakApart`，限数据区 |
| 右键菜单 | 自研 `GridContextMenu` | 无 | 原生 |
| 亮 / 暗主题 | CSS 变量 | `getComputedStyle` 读 `--bi-*` 转 `TableTheme` | `toggleDarkMode` + `MutationObserver` 跟 `html.dark` |

行操作的唯一差异是**插入方向**：vxe 上方、VTable 下方、Univer 上方。

### 2.2 单元格编辑

| 能力 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 直接键入进编辑 | 自研 `useGridKeys` | `keyboardOptions` 单字符键 | 原生 |
| 文本 / 数字编辑器 | 自研渲染器 | `InputEditor` | 原生 |
| 下拉 | `SelectEditor` | `ListEditor` | 原生 + `requireValueInList` 拦住非法值 |
| 日期 | `DateEditor`（日历弹层） | `DateInputEditor` | 无弹层、无 `dateFormat`，只认 `YYYY-MM-DD` |
| 换行 / 富文本 | 无 | 无（文本列单行 `InputEditor`，未引入 `TextAreaEditor`） | 原生 |
| 复制粘贴 | 自研 TSV 解析 | 内置 `copySelected` + 自研 TSV 粘贴 + 逐格 `coerce` | 原生 |
| 填充柄 | 自研 `useFillHandle`（数字等差 / 日期按天） | 原生手柄 + `mousedown_fill_handle` / `drag_fill_handle_end` → 自研 `fillLinear` 算值 | 原生 |
| 蚂蚁线 | 自研 `useCopyMarquee` 流动动画 | 内置 `showCopyCellBorder` 静态框 | 原生 |

### 2.3 校验

| 能力 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 下拉值域 | 编辑器约束 | `ListEditor` | `requireValueInList` 原生拦截 |
| 数字 min / max | 自研 | 自研 | 同步下发 `requireNumberBetween` |
| 数字必须整数 | 无 `rules.integer` | `rules.integer` | 无 |
| 日期必须真实 | `isRealDate` | `isRealDate` | 只过正则，`2026-02-30` 会通过 |
| 整列唯一 | 自研 | 自研 | 预建索引，O(n) |
| 跨列规则 | `gte / lte / eq / requiredIf` | 同 | 同 |
| 错误标红 | `cellClassName` | 列 `style` 回调实时校验 | `setBackground` + `setFontColor` |
| 校验触发时机 | 变更后整表复检 | 编辑即校验（不进热路径） | `revision` 去抖 260ms；≤3000 行整表复检，超限只在提交 / 结构变更时扫 |
| 校验面板 + 定位 | 自研 | 自研 | 自研 |
| 提交两段校验 | 本地 → mock 服务端 | 同 | 同 |

### 2.4 查询

| 能力 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 列筛选 | 自研 `FilterPanel` | 筛选抽屉 + 条件组合 | 原生列头漏斗 |
| 排序 | 自研（`remote: true`） | 自研 | 原生 |
| 查询条件可视化 | `GridQueryChips` | 条件列表 | 原生漏斗浮层 |
| 全局搜索 | 收窄行集 | 收窄行集 | 标黄 + 命中计数，不收窄 |
| 查找替换 | 自研 | 自研 | 自研（整表快照扫描） |

大小写 / 整格匹配、上一个下一个循环、全部替换三套都有。Univer 全局搜索只标黄的原因：行集归原生筛选器管，搜索框再收窄会和漏斗打架；真要收窄走列头漏斗。

### 2.5 汇总、导入导出、撤销

| 能力 | vxe 版 | VTable 版 | Univer 版 |
| --- | --- | --- | --- |
| 列汇总条 | 自研 `aggregate` | 列汇总 + 状态栏 | 只有状态栏选区统计（count / sum / avg / max / min） |
| 数值列数据条 | 自研 | 自研 | `setDataBar` |
| 导入 Excel | `xlsx` / `exceljs` + 日期序列号还原 | 同 | 同（`XLSX.SSF.parse_date_code`） |
| 导出 | Excel（全部 / 当前结果）+ CSV，不保留样式 | 同 | 同（排除筛选隐藏行） |
| 撤销 | 自研快照（含列结构） | 自研快照（含列结构） | 命令栈；列操作是整表重写，撤销后需重下发格式 |
| 数据草稿 | 无 | `saveDraft` / `resetDraft` | 无 |
| 压测数据 | 1k / 1w / 5w / **10w** | 有 | 500 / 1k / 5k / 1w |
| F1 帮助 | 全套自研 `useGridKeys` | 部分 | 本站接管 `Ctrl+F` / `F1`，其余用原生 |

## 3. 数据模型差异（决定实现方式的三条）

### 3.1 有没有「行对象」

- **vxe / VTable**：`Row = { __id, __dirty, name, age, ... }`，数组就是真相源，改一格等于改对象的一个属性。
- **Univer**：**没有行对象**，工作表是二维矩阵。`readRecords(defs)` 每次从区间 `getValues()` 现拼 `EntryRecord[]`：

  ```ts
  const HEADER_ROW = 0;
  toSheetRow = (i) => i + HEADER_ROW + 1;   // 数据下标 → 工作表行号
  toDataIndex = (r) => r - HEADER_ROW - 1;  // 工作表行号 → 数据下标
  ```

### 3.2 脏标记

| 做法 | 写在哪 | 代价 |
| --- | --- | --- |
| `row.__dirty = true`（vxe） | 行对象字段，编辑时顺手置位 | 无 |
| `row.changed = true`（VTable） | 同上 | 无 |
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

### 4.1 三条关键取舍

**① 值域约束优先下发给 Univer** —— `applyDataValidation` 把下拉编译成 `requireValueInList`、数字 `min/max` 编译成 `requireNumberBetween`，非法值在**输入时**就被拦住。自研校验层只负责必填、长度、正则、唯一、跨列。

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

**④ 查找替换不用 `FTextFinder`** —— 本 preset 组合下 `findAll()` 对任何关键词都返回 0（连单元格原值都搜不到），`matchCaseAsync` / `matchEntireCellAsync` **永不 resolve**。改为一次 `getValues()` 读成二维数组、内存里做子串 / 整格 / 大小写匹配，命中用 A1 表达。代价是大表每次搜索读一次全表值（1 万行 × 8 列 ≈ 8 万格，毫秒级），收益是行为完全可预期。

> 该项目前仍装着 `@univerjs/preset-sheets-find-replace`，对本页已无作用；若升级后 `FTextFinder` 恢复，可把 `scan()` 换回 facade。

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

## 6. 踩坑清单

**vxe**
- 列宽只认 px，百分比宽会被截断，`fit` 不要用；列宽按容器等比换算，容器尺寸变化要自己重算。
- 文本类校验发生在值已写入之后，要拦非法值在 `edit-closed` 里 reject。

**VTable**
- 在隐藏的 tab 里初始化会拿到 0 宽，列宽退化成保底值（右边缘留空）。必须容器可见后 `resize()`，宽度差 >4px 就重建。
- Canvas 取不到 CSS 变量，主题色建表时 `getComputedStyle` 读一次缓存，不能逐格读。
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
