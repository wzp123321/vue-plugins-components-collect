# Three.js 3D 地图 · 开发文档

> 范围：本仓库 `collect/src/pages/threejs/` 下所有与「Three.js 3D 地图」相关的实现。
> 核心模块是 **`threejs-china-3d-map`**（立体中国地图 + 省/市下钻 + 飞线 + 数据柱 + 标牌 + 选选择性泛光）。
> 另含两个入门级示例：`threejs.vue`（最小立方体）、`threejs-map/index.vue`（立方体 + 网格 + 控制器）。
>
> 依赖版本：`three@0.147.0`、`d3@7.9.0`、`gsap@3.15.0`、`vue@3.5`、`vite@5`。

---

## 1. 模块结构

```
threejs/
├── threejs.vue                          # 入门：一个立方体 + 平行光（MeshPhongMaterial）
├── threejs-map/index.vue                # 入门：立方体 + GridHelper/AxesHelper + OrbitControls + 阴影
└── threejs-china-3d-map/               # ★ 主功能：立体中国地图
    ├── threejs-china-3d-map.vue         # 页面入口（装配主组件 + 控制台 + 演示数据）
    └── china-map-3d/
        ├── index.ts                     # 模块桶文件（对外公共 API）
        ├── components/
        │   ├── ChinaMap3D.vue           # 核心编排层（场景/渲染循环/下钻/拾取/API 暴露）
        │   ├── MapControlPanel / MapSearchBox / MapTooltip / MapLegend /
        │   │   MapNavBar / MapPieChart / MapToolbar / MapHelpDialog / MapStageTip / MapDetailPanel
        │   └── spot/spotLayer.ts        # 数据柱 / 地理标牌 / 拾取热区
        │       spot/spotCanvas.ts       # 用 canvas 画数值卡片 / 标牌贴图
        ├── composables/                 # 逻辑拆分（每个一个关注点）
        │   ├── useMapViewport.ts        # 渲染引擎（相机/控制器/后期/主循环/视口）
        │   ├── useMapLayer.ts           # 单层地图几何（外轮廓+立体板块+升降动画）
        │   ├── useMapLevels.ts          # 层级栈与下钻流程编排
        │   ├── useSpotMarkers.ts        # 数据标记（分档→柱体/标牌）
        │   ├── useFlyLines.ts           # 飞线（枢纽辐射）
        │   ├── usePointerPick.ts        # 指针拾取（悬停/单击/双击）
        │   ├── useZoomDrill.ts          # 滚轮缩放下钻
        │   ├── usePyramidMarkers / useOrbitRoutes / useHeatmap / useCss2dLabels
        │   └── starfield.ts             # 星空背景
        ├── utils/
        │   ├── projection.ts            # 经纬度→世界坐标（d3 墨卡托 + 归一化）
        │   ├── geo.ts                   # GeoJSON 几何解析 / 外轮廓提取 / 合规校验
        │   ├── anchor.ts                # 标记锚点（柱/牌/线共用）
        │   ├── drawRegion.ts            # 单行政区 3D 板块（顶+侧壁+边界线）
        │   ├── drawOutline.ts           # 整体外轮廓（实线+光晕）
        │   ├── drawFlyLine.ts           # 飞线（ribbon 条带 + 流星头）
        │   ├── lineMaterials.ts         # Line2 材质工厂
        │   ├── textures.ts              # Canvas 程序化纹理 / Sprite 封装
        │   ├── data.ts                  # 数据分档 / 配色 / 伪随机兜底
        │   ├── amap-loader.ts           # GeoJSON 加载（内置+懒加载+CDN 兜底）
        │   ├── mapConfig.ts             # 全局视觉参数
        │   └── dispose.ts               # GPU 资源释放
        └── types/index.ts               # 共享类型（GeoJson 等）
```

**架构心法**：`ChinaMap3D.vue` 是「总装车间」，把若干 composable 编排到一起；真正持有场景与渲染循环的是 `useMapViewport`，其余 composable 只是往它的 `scene()` 里挂对象、往 `onTick` 里注册动画。所有几何/绘制细节下沉到 `utils`，UI 小组件只负责呈现。

---

## 2. 用到的 Three.js API 总览

### 2.1 核心场景图
| API | 用途 | 出处 |
|---|---|---|
| `THREE.Scene` | 场景根 | useMapViewport |
| `THREE.PerspectiveCamera` | 透视相机（FOV 32，near 0.5，far 4000），**`camera.up.set(0,0,1)` 改 Z-up** | useMapViewport |
| `THREE.WebGLRenderer` | 渲染器（`antialias`/`powerPreference:'high-performance'`/`alpha`/`preserveDrawingBuffer:true`）；`setPixelRatio(Math.min(dpr,1.8))`、`setClearColor(0,0)`、`toDataURL` 截图 | useMapViewport |
| `THREE.Object3D` / `THREE.Group` | 地图根、外轮廓、板块、标记分组；`userData.kind` 用于拾取识别，`userData.lift` 记录抬升高度 | 多处 |
| `THREE.Vector2` | 指针 NDC 坐标；Line2 分辨率 | usePointerPick / lineMaterials |
| `THREE.Vector3` | 数学运算：`cross`/`sub`/`lerp`/`addScaledVector`/`multiplyScalar`/`project`/`distanceToSquared` | 飞线/视口 |
| `THREE.Color` | 颜色插值 `lerp`、分档配色 | data / drawRegion |
| `THREE.Raycaster` + `setFromCamera` + `intersectObjects(root.children, true)` | 鼠标射线拾取（递归子节点） | usePointerPick |

### 2.2 控制器 / 标签
| API | 用途 | 出处 |
|---|---|---|
| `OrbitControls` | 轨道控制；`mouseButtons` 改左键=PAN/右键=ROTATE；`enableDamping`；`minPolarAngle/maxPolarAngle` 限幅防翻面；`autoRotate`；`screenSpacePanning` | useMapViewport |
| `CSS2DRenderer` / `CSS2DObject` | 高清 DOM 标签（css2d 模式），与 WebGL 共用宿主、每帧同帧渲染 | ChinaMap3D / useCss2dLabels |

### 2.3 几何体
| API | 用途 | 出处 |
|---|---|---|
| `THREE.Shape` + `THREE.ExtrudeGeometry({depth, bevelEnabled:false})` | 行政区板块（顶面 + 侧壁），**下钻=重建** | drawRegion |
| `THREE.PlaneGeometry(1,1).rotateX(PI/2)` | 数据柱（竖直 billboard 平面，uv.v=1 在柱顶） | spotLayer |
| `THREE.BufferGeometry` + `setAttribute`/`setIndex`/`setFromPoints` + `THREE.BufferAttribute` + `setUsage(THREE.DynamicDrawUsage)` | 飞线 ribbon（每帧重写顶点）、标牌引线 | drawFlyLine |
| `THREE.CircleGeometry` | 底部辉光圆盘、拾取热区 | useMapViewport / spotLayer |
| `THREE.Line` + `THREE.LineBasicMaterial` | 标牌引线 | spotLayer |
| `LineGeometry` + `Line2` + `LineMaterial`（`three/examples/jsm/lines/*`） | 粗线（内部界线、外轮廓+光晕），线宽按屏幕像素、需同步 `resolution` | drawRegion/drawOutline/lineMaterials |
| `THREE.QuadraticBezierCurve3` + `getSpacedPoints(SEGMENTS)` | 飞线弧（**等弧长采样**保证匀速） | drawFlyLine |

### 2.4 材质
| API | 用途 | 出处 |
|---|---|---|
| `THREE.MeshPhongMaterial` | 板块顶面（受光，悬停/选中改色） | drawRegion |
| `THREE.ShaderMaterial` | 侧壁竖直渐变+扫描流光；数据柱解析圆柱明暗；底部辉光；bloom 混合（顶点/片元 GLSL） | drawRegion / spotLayer / useMapViewport |
| `THREE.MeshBasicMaterial`（`vertexColors` + `AdditiveBlending` + `DoubleSide` + `depthWrite:false`） | 飞线拖尾（加法）/轨道 | drawFlyLine |
| `THREE.LineBasicMaterial` | 引线 | spotLayer |
| `THREE.SpriteMaterial` + `THREE.Sprite` | 柱顶光点、数值卡片、地理标牌（`depthTest:false` 永远压上） | spotLayer |

### 2.5 纹理 / 灯光
| API | 用途 |
|---|---|
| `THREE.CanvasTexture`（`LinearFilter` 双线性）、`document.createElement('canvas')` 径向渐变 | 光斑贴图、文字卡片贴图（textures.ts） |
| `THREE.AmbientLight` + `THREE.DirectionalLight`（主光+边缘光） | 板块受光 |

### 2.6 后期处理（`three/examples/jsm/postprocessing/*`）
| API | 用途 |
|---|---|
| `EffectComposer` ×2（`bloomComposer` 渲 bloom 层、`composer` 渲主画面） | 选择性泛光 |
| `RenderPass` | 场景渲染入口 |
| `UnrealBloomPass` | 辉光（strength 0.62 / radius 0.45 / threshold 0.52） |
| `ShaderPass` + 自定义 mix shader（`baseTexture + bloomTexture`） | 把 bloom 纹理加回主画面 |

### 2.7 动画
| API | 用途 |
|---|---|
| `gsap.to` / `gsap.delayedCall` / `gsap.killTweensOf` | 相机聚焦补间、`controls.target`/相机位移动画、板块抬升、入场生长、飞线延迟起飞 |
| `requestAnimationFrame` 主循环（**dt 钳制 ≤60ms** 防跳帧）、`onTick` 注册机制 | 逐帧驱动动画 |

### 2.8 投影 / 数据
| API | 用途 |
|---|---|
| `d3.geoMercator().center().scale().translate().invert()` | 经纬度→屏幕，再转世界坐标 |
| 本地 `fitProjection`（3 次迭代，归一化到 `MAP_EXTENT=130`） | 任意层级投影后最大边长一致，三级共用一套相机/厚度/柱尺寸 |
| `import.meta.glob('/src/assets/geojson/province/*.json')` | 省级数据懒加载（Vite 分包，**不能用动态 `import()` 拼路径**，生产会 404） |
| `fetch('https://geo.datav.aliyun.com/...')` | 市→区县 CDN 兜底 |

---

## 3. 核心实现讲解

### 3.1 坐标投影（地图几何基石）— `utils/projection.ts`
1. `focusRings(geo)`：按包围盒面积降序累加，只保留累计 98.5% 的主体环，忽略三沙、舟山外岛等极小的离岛（否则取景被撑爆）。
2. `fitProjection(geo)`：迭代 3 次，把投影包围盒中心移到原点、最大边长归一到 `MAP_EXTENT=130`；用 `proj.invert()` 反投影中心。
3. `createProjection(center, scale)`：逐点 `(lng,lat) → [x, y]`。
4. **坐标约定**：d3 返回的屏幕 y 向下，绘制时写 `(x, -y, z)` 翻成世界系（Z 朝上）。两处符号必须一致，否则地图上下颠倒。

> 为什么归一化：全国/省/市三级共用同一套相机距离、板块厚度、柱体尺寸、飞线弧度，下钻切换时无需按层级分支。

### 3.2 立体板块 — `utils/drawRegion.ts`
- 取环 → `THREE.Shape` → `ExtrudeGeometry({depth:6, bevelEnabled:false})` 拉伸成板块。
- 顶面用 `MeshPhongMaterial`（受光、可高亮）；侧壁用**共享 ShaderMaterial**：顶点传 `position.z`，片元按 `vZ/depth` 在底/顶色间 `mix`，并叠加一条随时间自下而上扫掠的发光带（uniform `uTime` 驱动）。
- 边界线用 `Line2`（内部界线）。线框层级 `lineZ = depth + 0.06`，紧贴顶面，斜看不飘离。
- 拾取只在顶面命中（`mesh.userData.kind='surface'`），侧壁不参与。

### 3.3 数据柱 / 标牌 — `components/spot/spotLayer.ts`
- **不用 CylinderGeometry**：细柱只有 2~3px 宽，圆柱分段法线独立 → 硬锯齿+明暗台阶。改用**竖直 billboard 平面**，`fragmentShader` 里用 `uv.x` 当圆柱截面 `body=sqrt(1-dx²)` 解析明暗 + `smoothstep` 解析抗锯齿。
- 柱高按 `(value/max)^0.85` 归一化；颜色按 `data.buildTiers` 分 4 档（深蓝→高值锚点色，分位点分档而非线性映射）。
- 柱体朝向：在 `onBeforeRender` 里只绕 Z 轴转方位角（`atan2(-dx,dy)`），保持竖直正对相机，**不**用完整 `lookAt`。
- 标牌默认全部收起，单击城市才显示该城市标牌（避免标签糊屏）；数值卡片按 `CARD_MAX_COUNT`(18) + 避让间距筛选。
- 透明 `CircleGeometry` 热区只供 `raycaster` 命中，不参与视觉。

### 3.4 飞线（流星）— `utils/drawFlyLine.ts`
- **不用 Line2**：Line2 每段独立四边形，接缝露 V 形缺口。改用**连续三角带 ribbon**：每点 2 顶点，横向 = `切线 × 视线`（永远正对相机）。
- 顶点每帧重写 → 包围球不更新 → 必须 `frustumCulled=false`。
- 用 `QuadraticBezierCurve3.getSpacedPoints()`（等弧长采样）保证匀速；`updateFlyLine` 按 `dt` 累加 `p`（不按绝对时间，防掉帧瞬移）。
- 组成：暗色轨道 + 加法混合彩色拖尾（白热核+尾焰，幂次衰减）+ 跟随曲线的 `Sprite` 彗星头。

### 3.5 选择性泛光 — `useMapViewport.render()`
- 飞线/数据柱的材质 `layers.enable(bloomLayer=1)`。
- 渲染：①`camera.layers.set(1)` → `bloomComposer.render()` 得辉光纹理；②`camera.layers.set(0)` → `composer.render()`（RenderPass + 自定义 ShaderPass 把 bloom 纹理加回）。
- 比「逐帧遍历替换黑材质」开销低且无闪烁。

### 3.6 下钻 = 重建地图 — `useMapLevels` + `useMapLayer`
- 双击/搜索命中的行政区 → `drill(properties)` → 关闭旧层（`layer.sink()` 压下动画）→ `loadCountry/drill` 取该层 GeoJSON → `layer.build()` **重新投影并构建几何**（不是相机飞入）。
- 层级栈 `history[]` 末尾为当前层；返回=pop 后重建，跳级=截断后重建。
- 合规校验：全国底图必须有台湾省（adcode `710000`）+ 九段线（adcode 以 `_JD` 结尾）。

### 3.7 指针拾取 — `usePointerPick.ts`
- 屏幕坐标 → NDC（`pointer.x=(x/width)*2-1; pointer.y=-(y/height)*2+1`）→ `raycaster.setFromCamera` → `intersectObjects`。
- 按 `userData.kind` 区分命中类型：`spotHit`（标记热区）/ `surface`（板块顶面）。
- 单击前用按下/抬起两点欧氏距离超过 `DRAG_THRESHOLD(6px)` 判定为拖拽，**不触发选中**（否则一松手就误选）。
- 悬停时后台 `prefetchDistrictGeoJson`，等双击时数据通常已在本地。

### 3.8 Z-up 相机与防翻面（关键约定）
- 地图躺在 XY 平面（Z 朝上）。`camera.up.set(0,0,1)` 后 OrbitControls 才是「绕地图法线转盘」；否则拖拽旋转会把地图翻面。
- 配合 `minPolarAngle=0.12`/`maxPolarAngle=1.02` 限幅，永不越过赤道看到板块背面。
- `clampTarget`：平移过头时把视点夹在 ±130 内，并让相机沿「相机→视点」向量同步补偿位移（否则变成斜着看）。

---

## 4. 入门示例（对照参考）

| 文件 | 用了什么 | 说明 |
|---|---|---|
| `threejs.vue` | `Scene`/`PerspectiveCamera`/`WebGLRenderer`/`BoxGeometry`/`MeshPhongMaterial`/`DirectionalLight` | 最小可运行：一个立方体 + 平行光，单次 `render` |
| `threejs-map/index.vue` | 上面 + `OrbitControls`/`GridHelper`/`AxesHelper`/`MeshStandardMaterial`/`shadowMap` | 立方体 + 网格/坐标轴 + 控制器 + 阴影 + 全屏 + 自适应 |

这两个是「Three.js 最小骨架」模板，复杂功能都在此基础上扩展。

---

## 5. 复用 / 扩展要点

- **新增装饰层**：仿 `usePyramidMarkers`/`useOrbitRoutes`，实现 `build()/clear()/tick()/setVisible()` 四件套，挂到 `layer.root()`，随层级重建。
- **换数据源**：改 `amap-loader.ts`（`fetchChinaGeoJson`/`fetchDistrictGeoJson`），只要产出 `GeoJsonType` 即可；务必跑 `checkCountryCompliance` 确认台湾省+九段线齐全。
- **调视觉参数**：集中改 `utils/mapConfig.ts`（厚度、线宽、柱尺寸、飞线弧度、bloom 图层号等），不要在模块里硬编码。
- **对外 API**（`ChinaMap3D` 通过 `defineExpose` 暴露）：`drillByAdcode` / `locateByAdcode` / `locateByName` / `jumpTo` / `resetToCountry` / `playEntrance` / `selectByAdcode` / `currentLevel`。

---

## 6. 踩坑实录（最值钱的部分）

1. **Z-up**：地图在 XY 平面，必须 `camera.up.set(0,0,1)`，否则 OrbitControls 拖拽=翻面。
2. **下钻=重建**：`fitProjection` 把任意层级归一化到 `MAP_EXTENT=130`，三级共用一套参数；别用相机飞入替代。
3. **线框贴顶面**：`lineZ = depth + 0.06`，原 1.5 悬浮会让边境线斜看飘离。
4. **HMR 残留画布**：canvas 是 `appendChild` 注入（不在模板），`start()` 前先清空容器、`stop()` 里 `canvas.remove()`，否则两块画布叠加。
5. **选择性泛光用相机图层切换**（`camera.layers.set(1/0)`），别逐帧遍历换黑材质；别用 `GammaCorrectionShader` 全局提亮（会让深色地图发灰蓝）。
6. **数据柱用 billboard 平面 + uv 解析明暗**，别用 `CylinderGeometry`（细柱锯齿）；如改回受光材质务必用 `normalMatrix` 而非 `mat3(modelMatrix)*normal`，避免非等比缩放法线畸变。
7. **飞线用连续 ribbon 而非 Line2**；`frustumCulled=false`；`getSpacedPoints` 等弧长采样；`progress` 按 `dt` 累加。
8. **锚点统一走 `anchorOf()` 取 `properties.center`**（贴边时回拉到 centroid 方向），绝不用 `centroid` 直接当锚点（会飘进无人区）；柱/牌/线三处必须共用同一锚点。
9. **Line2 线宽是屏幕像素**，必须 `setLineResolution` 同步 `resolution`，否则线宽随画布缩放错乱。
10. **GeoJSON 懒加载用 `import.meta.glob`**，生产构建不能用 `import('@/...')` 动态拼路径（会 404）。
11. **CSS2D 标签的 DOM 是动态注入**到 `CSS2DRenderer.domElement`，`scoped` 样式打不中，必须放非 scoped 全局块。
12. **点击 vs 拖拽**：用按下/抬起距离阈值区分，否则 OrbitControls 拖拽松手即误选。

---

## 7. 详细实现步骤（伪代码）

> 把第 3 节「核心实现讲解」落回到可照抄的算法级伪代码。每一段对应一个真实函数，文件名已标注，便于跳转源码。

### 7.1 投影归一化 `fitProjection` — `utils/projection.ts`
目标：任意层级（全国/省/市）投影后包围盒中心归原点、最大边长 = `MAP_EXTENT(130)`，三级共用一套相机/厚度/柱尺寸。

```
fitProjection(geo, extent=130):
  rings = focusRings(geo)                 // 仅看累计 98.5% 主体环，忽略离岛
  if rings.empty: return FALLBACK
  center = lngLatCenterOf(rings)          // 初值：经纬度几何中心
  scale  = 100
  for iter in 0..2:                       // 迭代 3 次收敛
    proj   = mercator(center, scale)      // d3.geoMercator().translate([0,0])
    bounds = boundsOf(rings, proj)        // 世界坐标：y = -screenY（向上）
    scale *= extent / max(bounds.width, bounds.height)
    // 把包围盒中心反投影成新 center，使地图归中
    mid = proj.invert([ (minX+maxX)/2, -(minY+maxY)/2 ])   // 注意还原成 d3 的 y 向下
    center = mid
  return { center, scale, bounds: boundsOf(rings, proj, step=1) }

boundsOf(rings, proj):                    // 遍历采样点求 min/max
  for ring in rings: for pt in ring(step):
    p = proj(pt); if p: update minX/maxX/minY/maxY using (p.x, -p.y)
  return {width:maxX-minX, height:maxY-minY, cx, cy}
```

### 7.2 立体板块 `createRegion` — `utils/drawRegion.ts`
把单个行政区的环拉伸成 3D 板块：顶面受光 + 侧壁 Shader 渐变 + 内部界线。

```
createRegion(feature, project):
  for ring in featureRings(feature):
    pts = []
    for [lng,lat] in ring:
      [x,y] = project([lng,lat])
      pts.push(x, -y, lineZ)              // (x,-y,z)：屏幕 y 向下→世界 y 向上
    if pts.length < 9: continue           // <3 点构不成面，丢
    shape = Shape(); shape.moveTo(pts[0],pts[1])
    for i in 3..len step 3: shape.lineTo(pts[i],pts[i+1])
    geo  = ExtrudeGeometry(shape, { depth: mapConfig.depth, bevelEnabled:false })
    mesh = Mesh(geo, [topPhong, sideShader])   // 材质[0]=顶面 [1]=侧壁
    mesh.userData.kind = 'surface'        // 仅顶面参与射线拾取
    line = Line2(LineGeometry.setPositions(pts), innerLineMat)  // 内边界紧贴顶面
    region.object.add(mesh, line)
  return region
```

### 7.3 侧壁 ShaderMaterial（渐变 + 扫描流光）— `utils/drawRegion.ts`
所有板块共用一份材质，顶点传 `position.z`，片元按 `vZ/depth` 竖直渐变 + 时间驱动的扫掠带。

```
// vertex
varying float vZ;
void main(){ vZ = position.z; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }

// fragment
uniform vec3 topColor, bottomColor, uScanColor;
uniform float depth, uTime, uScanWidth, uScanSpeed, uScanIntensity;
varying float vZ;
void main(){
  float h = clamp(vZ/depth, 0.0, 1.0);
  vec3 base = mix(bottomColor, topColor, h);          // 底→顶竖直渐变
  float head = fract(uTime*uScanSpeed);               // 扫掠头 0→1 循环
  float d = abs(h-head); d = min(d, abs(h+1.0-head)); // 环形过渡（到顶/底不突变）
  float scan = smoothstep(uScanWidth, 0.0, d);         // 窄带高亮
  base += uScanColor * (scan*uScanIntensity);          // uScanIntensity=0 即纯渐变
  gl_FragColor = vec4(base, 1.0);
}
// 每帧：updateRegionScan(elapsed) → sideMaterial.uniforms.uTime.value = elapsed
// 开关：setRegionScan(on) → uScanIntensity = on ? mapConfig.decor.scan.intensity : 0
```

### 7.4 外轮廓提取（边计数法）`extractOuterRings` — `utils/geo.ts`
只出现一次的边必为外边界，再用邻接表拼成连续环（比逐边扫描快一个量级）。

```
extractOuterRings(geo):
  counts = Map<key,int>(); edges = Map<key,Edge>()
  keyOf(a,b) = a<b ? "a.x,a.y|b.x,b.y" : "b.x,b.y|a.x,a.y"   // 规范化，正反边归同 key
  for ring in allRings(geo):
    for i in 0..ring.len-2:
      e = Edge(ring[i], ring[i+1])
      k = keyOf(e.p1, e.p2); counts[k]++; if !edges.has(k): edges[k]=e
  boundary = [edges[k] for k,c in counts if c==1]            // 出现一次=外边界
  byStart = Map<point, Edge[]>(); for e in boundary: byStart[e.p1].push(e)
  rings = []
  for start in boundary:
    if used(start): continue
    ring = [start.p1, start.p2]; cur = start; used(cur)=true
    loop:
      next = byStart[cur.p2].find(e=>!used(e)); if !next: break
      used(next)=true; ring.push(next.p2)
      if next.p2 == start.p1: break
    if ring.len>2: rings.push(ring)
  return rings
```

### 7.5 组装 + 升起入场动画 `useMapLayer.build` — `composables/useMapLayer.ts`
顺序讲究：先轮廓 → 切片建板块（让出主线程）→ 升起（压扁补间到 1，错峰）。

```
build(level, {rise, report}):
  project = createProjection(level.fit.center, level.fit.scale)
  group.position = (-bounds.cx, -bounds.cy, 0)   // 地理中心→世界原点
  scene.add(group)
  group.add( createOutline(level.geo, project) )  // ① 先画外轮廓（先看到边境线）
  created = []; sliceStart = now()
  for i, feature in level.geo.features:           // ② 时间切片逐块生成
    node = createRegion(feature, project)
    if node: group.add(node.object); created.push(node.object)
    if now()-sliceStart >= 8ms or i==last:         // 单帧预算 8ms，超了让出主线程
      report(`生成立体板块 ${i+1}/${total}`, ratio); await nextFrame(); sliceStart = now()
  if rise:                                         // ③ 升起：压扁→补间到 1，延迟错峰
    created.forEach((obj,i)=>{ obj.scale.z = 0.001;
      gsap.to(obj.scale, { z:1, duration:0.5, delay:i*0.012, ease:'power2.out' }) })

// 切层下沉：旧层 scale.z 压到 0.001 再释放（sink）
sink(duration=0.28):
  gsap.to(root.scale, { z:0.001, duration, ease:'power2.in', onComplete: ()=>clear() })
```

### 7.6 Z-up 相机 + 防翻面 — `composables/useMapViewport.ts`
地图躺在 XY 平面，必须 Z-up；限幅极角 + 平移同步补偿防翻面/防拖出画面。

```
start():
  camera = PerspectiveCamera(FOV=32, aspect, 0.5, 4000)
  camera.up.set(0,0,1)                           // 关键：Z 朝上
  target = (0,0, mapConfig.depth)
  camera.position = viewDir(tilt=30, azim=-90) * dist + target
  controls = OrbitControls(camera, canvas)
  controls.minPolarAngle = 0.12; controls.maxPolarAngle = 1.02   // 限幅，永不越过赤道看背面
  controls.addEventListener('change', clampTarget)

clampTarget():                                   // 平移过头时相机同步补偿
  touched = false
  if |target.x|>130: target.x = clamp(target.x,-130,130); touched=true
  if |target.y|>130: target.y = clamp(target.y,-130,130); touched=true
  if touched:
    offset = camera.position - target
    camera.position = target + offset            // 相机沿「相机→视点」向量同步移动，否则变斜看

viewDir(tilt,azim):                              // 单位视线向量
  t=tilt*π/180; a=azim*π/180
  return ( sin(t)*cos(a), sin(t)*sin(a), cos(t) )
```

### 7.7 选择性泛光（相机图层切换）— `useMapViewport.render`
飞线/数据柱 `layers.enable(bloomLayer=1)`；渲染时切换相机图层，不必逐帧换材质。

```
render():
  if bloomComposer:
    camera.layers.set(1)                         // 只渲 bloom 层（飞线/数据柱）
    bloomComposer.render()                        // → 辉光纹理（renderToScreen=false）
  camera.layers.set(0)                            // 切回默认层渲全场景
  composer.render()                               // RenderPass + ShaderPass(base+bloom)

// bloom 混合 ShaderPass：
// gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv)
// UnrealBloomPass(strength=0.62, radius=0.45, threshold=0.52)
```

### 7.8 指针拾取（射线 + 拖拽阈值）— `composables/usePointerPick.ts`

```
pickAt(clientX, clientY):
  rect = host.getBoundingClientRect()
  pointer.x =  ((clientX-rect.left)/rect.width )*2 - 1
  pointer.y = -((clientY-rect.top )/rect.height)*2 + 1      // 屏幕原点左上→NDC 中心，y 翻转
  raycaster.setFromCamera(pointer, camera)
  hits = raycaster.intersectObjects(root.children, true)     // 由近及远
  spot = hits.find(h => h.object.userData.kind=='spotHit')
  if spot: return { kind:'spot',  spot: spot.object.customProperties, point: spot.point }
  surf = hits.find(h => h.object.userData.kind=='surface')
  if surf: return { kind:'region', properties: surf.object.userData.region.customProperties, point: surf.point }
  return null

handleClick(e):                                          // 点击 vs 拖拽
  if hypot(e.clientX-downX, e.clientY-downY) > DRAG_THRESHOLD(6): return   // 视为拖拽
  pick = pickAt(e.clientX, e.clientY)
  pick ? onSelect(pick) : onMiss()                       // 落空→取消选中

handleMove(e):                                           // 每帧最多拾取一次
  pendingEvent = e
  if !framePending: framePending=true; requestAnimationFrame(()=>{ pick=移动拾取; onHover(pick); framePending=false })
```

### 7.9 飞线 ribbon（连续三角带）— `utils/drawFlyLine.ts`
不用 Line2（接缝露 V 缺口）；用每点 2 顶点的连续三角带，横向 = 切线 × 视线，永远正对相机。

```
createFlyLine(from, to, {tint,speed,phase}):
  dist = hypot(to[0]-from[0], to[1]-from[1])
  arc  = arcBase + min(arcMax, dist*arcRatio)             // 越远弧越高
  curve = QuadraticBezier3( (from.x,-from.y,z), (中点.x, -中点.y, z+arc), (to.x,-to.y,z) )
  pts   = curve.getSpacedPoints(140)                      // 等弧长采样→全程匀速
  tan   = collectTangents(pts)                            // 单边差分求单位切线
  track  = ribbonGeometry(pts, tan, trackHalf)            // 暗色轨道（NormalBlending）
  streak = ribbonGeometry(pts, tan, streakHalf)           // 彩色拖尾（AdditiveBlending）
  track.frustumCulled = streak.frustumCulled = false      // 顶点每帧重写→包围球不更新
  head = Sprite(glowTexture); head.layers.enable(bloomLayer)

writeRibbon(positions, pts, tan, camPos, widthAt):
  for i in 0..pts.len-1:
    toCam = (camPos - pts[i]).normalize()
    side  = tan[i].cross(toCam).normalize()              // 横向=切线×视线，正对相机
    hw = widthAt(i); o = i*6
    positions[o..o+2]   = pts[i] + side*hw
    positions[o+3..o+5] = pts[i] - side*hw

updateFlyLine(anim, dt, elapsed, camPos, cameraMoved):
  anim.p += dt*anim.speed; if anim.p>=1: anim.p-=1       // 按 dt 累加推进（防掉帧瞬移）
  fade = min(1, min(anim.p, 1-anim.p)/0.08)             // 首尾 8% 弧长淡入淡出
  for i in 0..n-1:
    behind = anim.p - i/(n-1)
    if 0<=behind<band:
      tail = pow(1-behind/band,1.7)*tailGain
      core = behind<CORE_SPAN ? pow(1-behind/CORE_SPAN,2)*coreGain : 0
      col  = (tint*tail + white*core) * fade
    write colors[left]=colors[right]=col
  if camPos: writeRibbon(streak.positions, pts, tan, camPos, i=> headWidth(anim.p,i))
  anim.head.position = samplePoint(pts, anim.p)          // 彗星头跟随同一条曲线
  anim.head.scale = headSize * (1 + 0.1*sin(elapsed*9+phase))
```

### 7.10 数据柱（billboard 平面 + uv 解析圆柱明暗）— `components/spot/spotLayer.ts`
不用 CylinderGeometry（细柱锯齿+明暗台阶）；用竖直 billboard 平面，片元里按 `uv.x` 解析圆柱截面，天然绕开非等比缩放法线畸变。

```
// 几何：单位平面立起来，uv.v=1 落在柱顶
geo = PlaneGeometry(1,1); geo.rotateX(PI/2)

// 材质 fragment：用 uv.x 当圆柱横向截面
dx = uv.x*2.0 - 1.0
body = sqrt(max(0.0, 1.0 - dx*dx))              // 中间正对相机最亮，两侧掠射渐暗
shade = 0.6 + 0.4*pow(body, 0.75)
col   = mix(uColor*0.45, uColor, pow(uv.y,0.7)) * shade
alpha = mix(0.5, 1.0, pow(uv.y,0.5)) * smoothstep(1.0, 0.86, abs(dx))   // 横向解析 AA，细柱无硬边

// 朝向：只绕 Z 转方位角（保持竖直正对相机），不用完整 lookAt
column.onBeforeRender = (camera)=>{
  dir = camera.position - column.position
  column.quaternion.setFromAxisAngle(Z_AXIS, atan2(-dir.x, dir.y))
}

// 柱高：按 (value/max)^0.85 归一，最小 22% 保底
height = columnHeight * (0.22 + 0.78*pow(ratio, 0.85))

// 生长：只改 scale.z / position.z，不动 .visible（与显隐规则分离）
applySpotGrowth(layer, t):
  k = easeCubicOut( clamp((t - grower.delay)/(1 - grower.delay), 0, 1) )  // 错峰：高值柱先长
  grower.column.scale.z = max(0.0001, height*k)
  grower.column.position.z = baseZ + height*k/2
  grower.cap.position.z = baseZ + height*k                            // 柱顶光点跟随

// 显隐（与生长分离）：数据柱模式下仅选中城市显示标牌
applySpotVisibility(layer, showColumns, selectedAdcode):
  layer.columns.visible = showColumns
  for [ad,plate] in plateByAdcode: plate.visible = showColumns ? ad==selectedAdcode : true
  for [ad,card ] in cardByAdcode:  card.visible  = ad != selectedAdcode   // 选中城市卡片让位给标牌
```
