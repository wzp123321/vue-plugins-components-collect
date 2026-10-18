# 项目长期记忆（vue-plugins-components-collect）

## vxe-table v4（OSS）关键事实（excel-data-entry-vxe 录入台踩坑沉淀）
- **cell-area（单元格区域选取/复制粘贴/查找替换）是 pro 功能**：OSS 构建中 `getCellAreas/handleKdClAreaEvent/handlePeClAreaEvent` 仅有防御性空引用、无实现，`mouse-config.area:true` 静默失效 → 选区必须自研（`hooks/useCellSelection.ts`）。
- **DOM 约定**：td 带 `colid`（列实例 id，用 `tableRef.getColumnById(colid).field` 换 field），tr 带 `rowid`（= row[row-config.keyField] 的 encodeURIComponent；**不是** data-field/data-rowid）。
- `current-change` 是**已废弃的行级事件**（params 无 column）；vxe 全部键盘处理依赖 `editStore.selected`，仅 `mouse-config.selected:true` 时才有值 → 自管键盘导航时须将 keyboardConfig 的 isArrow/isTab/isEnter/isEdit/isChecked 全关。
- vxe 的 `focus()` 只置内部 isActivated、不做 DOM 聚焦：点击单元格后 `document.activeElement` 仍是 body，快捷键激活判定不能依赖 `contains(activeElement)`，需自维护激活标志。
- 单元格编辑器的 el 组件去边框关键是 `box-shadow:none`（EP 输入框边框实为 wrapper 的 inset box-shadow）。
- **列宽只认 px**：`%` 宽会被 `XEUtils.toInteger`（parseInt）截断成整数百分比；官方 `fit`  prop 注释明示"可能废弃，不要使用"。宽度盛满容器需自算：量 `.vxe-table--body-wrapper.body--wrapper`（overflow:hidden 外层，与 vxe 内部 autoCellWidth 取 clientWidth 同元素；fixed wrapper 无 `body--wrapper` 类，选择器必须带）→ 基准宽等比换算 px、末列吸收余量再 -1px 防横向滚动条。
- **真正滚动的是 `.vxe-table--body-inner-wrapper`**；`.vxe-table--body-wrapper` 是 overflow:hidden 定位壳（绑滚动监听别绑错）。
- `scrollToRow` 时序坑：数据变更当轮内部行高偏移 oTop 未重算（初始 0）会静默失败，其自带 350ms 兜底在 show-overflow（isAllOverflow 恒 true）下被跳过 → 需短周期重试。
- **原地 push/splice 行数组不触发 vxe 更新**：查询管道无关键词分支若返回 `allRows.value` 原引用，pagedRows 引用不变 → `:data` prop 不更新 → 新行根本不渲染（页面自己的计数会因渲染 Effect 跟踪 `.length` 而假性更新）→ 必须 `.slice()` 返回新数组。
- 序号列（`column.type` 非空）不参与自研拖选；点序号选中整行走 cell-click 通道；新增行同步 currentCell 要用一次性标志跳过选区塌缩 watch。
- **`getActiveCell` 不是 vxe OSS 表格实例方法**（右键取格不要用它，会拿到过期值）：一律用坐标 → `.vxe-body--row@rowid` + `.vxe-body--column@colid` 降级解析。
- **copy/paste/contextmenu 监听必须挂 window**：这些事件派发在 `document.activeElement`（点格后仍是 body）或最顶层元素（fixed 菜单会遮住单元格成为 target），挂在 gridWrapper 上不在事件路径上、永远收不到；作用域用 gridActive 标志判，输入框 target 豁免。
- **Esc/F1 等全局键要放在 inGrid 守卫之前**：右键落点被菜单遮住时 mousedown target 是菜单 → gridActive=false，放在守卫后会整段失效。
- **事件名**：表头点击是 `header-cell-click`（不存在 `header-click`）；列宽拖拽是 `column-resizable-change`（`resizable-change` 已标废弃）。点表头想干别的必须先看 sort-config：`trigger:'cell'` 会让点表头直接排序，改 `'default'` 才归你；params 自带 `triggerSort/triggerFilter/triggerResizable` 可做守卫。
- **构造行必须剥离 init 里的 `__id/__dirty`**：`{ __id: uid(), ...init }` 遇 `makeRow({...row})`（复制行）会被原主键覆盖 → 两行同 id，vxe 报主键重复，编辑/选区/校验全串行。
- 十字高亮这类"叠加态底色"要用 `background-image`：`background-color` 会被 `cell-sel`(!important) / `cell-error` 吃掉，image 可与任何底色共存。
- 手柄类元素用了 `@pointerdown.prevent` 就收不到 dblclick（兼容性鼠标事件被吞），双击要自己按时间戳判。

## excel-data-entry-vxe 架构约定
- 页面壳 `excel-data-entry-vxe.vue` + 12 个 hooks + 9 个 SFC + cells/（el 编辑器注册与 display 渲染器）；验证用 `node_modules/.bin/vue-tsc --noEmit` 筛选 `excel-data-entry-vxe`。
- 已移除行选中（复选框列/isCurrent/mouse selected），批量操作（删行/复制行/批量填充/Ctrl+A）统一以框选选区为作用域；复制/粘贴优先读选区；选区视觉 = 淡色底 + 区域四边外框（CSS 自定义属性拼接 box-shadow，角格自动合成两条）。
- 新增/插入/复制行只有序号列有值（`emptyValueFor` 一律空串，select 不预选首项），并立即 `validateRow` 标红必填缺失。
- Excel 键鼠语义约定：**活动格白底跟 anchor 不跟 currentCell**（Shift 扩展后 currentCell 会跟到 focus 端，Excel 白底始终在起始格）；**Ctrl+D = 向下填充**（选区首行逐列复制到其余行，复制整行在工具栏按钮）；**填充手柄恒显 selRect 右下角且方向感知**（下拖源=末行、范围=末行之下；上拖源=首行、范围=首行之上；落在原选区内不填充）；选区内右键保留框选、选区外塌缩；Esc 关右键菜单；F1 帮助面板（GridHelpDialog，快捷键清单以此为准）。
- **复制蚂蚁线（Excel marching ants）**：Ctrl+C/菜单复制成功后源区域显示虚线动画边框（mouse.copiedRect 独立快照 + copyMarquee SVG overlay，`stroke-dashoffset` 循环动画；box-shadow 不支持 dashed 别硬拼）；Ctrl+V/Esc 消除；滚动/行数变化重定位。**复制态下与 copiedRect 重合的选区格不挂 sel-t/b/l/r 实线外框类**（让位给蚂蚁线，否则同色同位实线压住行军效果）。copySelection 返回 boolean 供菜单复制判断成败。
- **粘贴数据校验（applyPasteText）**：select 列非选项值跳过+提示（写进去显示/编辑器双双异常）；date 列经 `normalizeDate`（2024-01-05 / 2024/1/5 / 2024年1月5日 → YYYY-MM-DD，含闰年校验）非法跳过+提示；写入格统一 validateCell + 未通过数汇总提示；粘贴后 core.flashCells 闪烁写入区。`confirmAddCol` 回填用 `emptyValueFor`（不预选首选项）且必填列立即逐行校验；`batchFill` 数字列 NaN 防护。
- 状态栏统计双轨：当前列全量统计（activeStats）+ 选区内数字格聚合（ops.selectionStats）。
- 用户明确：不做导入导出方向的新功能；编辑单元格必须用 element-plus 组件、输入框无边框、编辑不高亮整列。
- **真机验证坑**：可见区末行是被裁切的半行、其中心落在网格外，点它等于点网格外（gridActive=false）——要操作真末行必须先滚 `scrollTop=scrollHeight`；用例间切换行区间要显式滚回顶部（cellBox 对不可见行返回陈旧坐标）；**每次 Edit 后必须跑 vue-tsc**（曾因误删换行把 `const rect` 并进注释行，运行时才炸）。

## 3D 中国地图（threejs-china-3d-map）架构与踩坑
- **编辑落盘不可信**：Edit 工具偶尔「返回成功但磁盘仍是旧内容」（疑似 IDE 侧保存覆盖）。改完必须 grep 复核关键字符串；源码改完还要重启 vite dev 再冒烟（HMR 可能仍给旧模块）。
- **DataV `properties.center` 是主城区/驻点坐标**，不是几何中心：安庆、池州这类沿江城市主城区贴市域边界（距边界仅等效半径 2%~4%），柱体/飞线会看着长在板块边上。统一走 `utils/anchor.ts` 的 `anchorOf()`（贴边时朝 centroid 回拉到 0.2×等效半径，上限 0.6 步长 0.1），柱体/标牌/飞线共用同一锚点。
- **左键默认 PAN**（`dragMode:'pan'`，上下拖＝屏幕空间远近），右键旋转；`clampTarget` 把视点夹在 ±130 内并让相机同步补偿，避免地图被拖出画面。控制台可切回 rotate。

- **下钻 = 重建地图**（不是相机飞入 + pivot 拉伸）：`utils/projection.ts` 的 `fitProjection()` 把任意层级 GeoJSON 投影后最大边长归一到 `MAP_EXTENT=130` 世界单位，因此全国/省/市三级共用同一套相机距离、拉伸厚度、柱体尺寸与飞线弧度。层级栈 `history[]`，末尾为当前层；`返回上级` 即 pop 后重建。
- **相机必须 `camera.up.set(0,0,1)`**：地图躺在 XY 平面（Z 朝上），OrbitControls 默认 Y-up 会让"拖拽旋转"变成翻面；改成 Z-up 后才是绕地图法线的转盘旋转，配合 `minPolarAngle/maxPolarAngle` 限幅永不翻面。
- 取景距离用**几何角点投影迭代**（`computeFitDistance`：8 个包围盒角点 project 到 NDC，按 max|ndc| 反推距离），不要用 FOV 经验公式，斜视角/宽高比都会算偏。
- **标记位置用 `properties.center`，不要用 `centroid`**：DataV 的 centroid 是几何质心，内蒙古/西藏/新疆会落在荒漠或边境（例：内蒙古 114.07,44.33 vs 呼和浩特 111.67,40.81）。
- **非等比缩放的柱体法线必须用 `normalMatrix`**：柱高靠 `scale.y=h` 拉伸，用 `mat3(modelMatrix)*normal` 会让法线沿高度畸变 → 柱子出现"一节一节错亮"。改用 `normalize(normalMatrix*normal)` + `uv.y` 取高度即可。
- **不要叠加 `GammaCorrectionShader`**：它把暗色按 pow(1/2.2) 提亮，深色地图会整体发灰蓝（#0C1A33 → 近似 #4A6C9E）。
- 线框 `lineZ` 必须贴顶面（`mapDepth + 0.06`）：原来悬浮 1.5，斜视角下北侧边境线会明显离开板块边缘。
- 飞线连贯性：progress 必须按 **dt 累加**（不要用 `performance.now()*speed` 再被帧预算跳过），另加"彗星头" Sprite 跟随同一条曲线。
- **飞线不要用 Line2**：Line2 是「每段一个独立 quad」，段长与线宽同量级时接缝错位会把线画成一串方块（链条感）。段数调高调低都不消失。正解 = **连续三角带 ribbon**：每点 2 顶点、横向 = `tangent × (camera - point)`（永远正对相机）、顶点色同一份写左右两顶点、逐点宽度收细成头宽尾尖。ribbon 顶点每帧重写 → 必须 `frustumCulled = false`，clear 时按 `userData.shared` 区分是否 dispose。等弧长采样用 `curve.getSpacedPoints()`。
- **数据柱不要用细 CylinderGeometry**：圆柱每段顶点法线独立（rim 光会出 22.5° 一圈的亮度台阶），且 2~3px 宽时轮廓是多边形硬边 —— 无论多少段都「一节一节」。正解 = **竖直 billboard 平面**（`PlaneGeometry(1,1).rotateX(PI/2)`，宽沿 X 高沿 Z），片元里 `body = sqrt(1-dx²)` 模拟圆柱截面明暗 + `smoothstep(1.0, 0.86, |dx|)` 做解析 AA；朝向在 `onBeforeRender` 里 `setFromAxisAngle(Z_AXIS, atan2(-dir.x, dir.y))` 只转方位角（柱身保持竖直）。
- **HMR 会残留画布**：canvas 是 `appendChild` 进去的、不在模板里，旧实例 unmount 不会摘 DOM → 两块 canvas 叠加，旧画面（常是上个层级的 hover 态）看起来像「地图下面还有一张图」。mount 时先清空容器内 canvas、unmount 时 `canvas.remove()`。
- 选择性泛光用**相机图层切换**（`camera.layers.set(1)` 渲 bloom → `set(0)` 渲主画面），别用「逐帧 scene.traverse 换黑材质」那套，对象一多就掉帧。
- 「地理标牌」= canvas Sprite + 引线 + 定位点；数据柱模式下默认全部收起，**单击城市才显示该城市标牌**（同时隐藏它自己的数值卡片），关闭数据柱时全量显示。
- 验证手段：Edge headless + CDP（`--use-angle=swiftshader --remote-debugging-port`）+ Node22 内置 WebSocket 手写 CDP 脚本（/tmp 下，不入库）。注意 swiftshader 软件渲染下一帧 200~500ms，`await requestAnimationFrame` 分批建图会放大到 8s 左右，真实 GPU 上不到 1s，勿据此判断性能。
