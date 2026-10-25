/**
 * 能力画像（需求 → 工具 的倒排索引）
 *
 * 背景：收集站过去按「插件 → demo」组织，工作中检索是「需求 → 工具」，
 * 方向相反导致「明明收过但想不起来」。本文件把每个条目的知识倒过来写：
 * 不是「这个插件有什么功能」，而是「什么需求该用它 / 要付出什么代价 / 什么需求别用它」。
 *
 * 维护约定（写进 CLAUDE.md）：
 * - 新示例进站时必须补一条 profile，needs 写真实需求句，敢写 level: 'no'
 * - 「不能」的结论比「能」更值钱；踩过的坑写进 notes
 * - level: 'fits' 直接可用 / 'partial' 要自己封装或有代价 / 'no' 不适用
 */

export interface CapabilityNeed {
  /** 工作需求句（第一人称描述，检索按这句话命中） */
  text: string;
  /** fits: 直接可用 / partial: 要自己封装或有代价 / no: 不适用 */
  level: 'fits' | 'partial' | 'no';
  /** 代价与原因说明 */
  comment?: string;
}

/**
 * 详细应用（用法面）：把「怎么用」从 demo 源码里抽出来，发现即拿到用法。
 * install 与 snippet/keyApi 同时进入语义检索正文，搜包名（如 exceljs）也能命中。
 */
export interface CapabilityUsage {
  /** 安装命令；原生能力填 '内置（无需安装）' */
  install?: string;
  /** 最小可用代码片段（单段，含关键 import 与调用） */
  snippet?: string;
  /** 关键 API / 配置点（短句，速记与检索用） */
  keyApi?: string[];
  /** 指向站内 demo 页（默认用 profile.path，可覆盖更具体子路由） */
  demoPath?: string;
}

export interface CapabilityProfile {
  /** 对应 navGroups / 路由中的 path（合集入口或独立示例） */
  path: string;
  /** 一句话定位：命令面板与能力地图展示 */
  positioning: string;
  /** 需求结论清单 */
  needs: CapabilityNeed[];
  /** 详细应用：安装 / 最小代码 / 关键 API / 指向 demo */
  usage?: CapabilityUsage;
  /** 落地要点：从 demo 到生产要补什么、踩过什么坑 */
  notes?: string[];
  /** 同类方案互链（其他条目 path），选型对比用 */
  alternatives?: string[];
}

export const capabilityProfiles: CapabilityProfile[] = [
  /* ================= 组件库 · 通用组件与指令 ================= */
  {
    path: '/capability-map',
    positioning: '本站的能力倒排索引：按需求句找工具，而不是按插件名翻目录',
    needs: [
      { text: '接到一个需求不知道站里有没有现成方案', level: 'fits' },
      { text: '想知道某个方向都有哪些可选方案对比', level: 'fits' },
    ],
  },
  {
    path: '/component-home',
    positioning: '组件库导航页：通用组件与业务组件的总入口',
    needs: [{ text: '浏览站内全部组件能力', level: 'fits' }],
  },
  {
    path: '/component-inputFilter',
    positioning: '输入过滤组件：对 el-input 做格式化与限制',
    needs: [
      { text: '输入框只能输数字/金额/固定位数', level: 'fits' },
      { text: '输入时实时格式化（千分位、去空格）', level: 'fits' },
      { text: '表单提交前的复杂校验', level: 'no', comment: '那是 el-form rules 的职责，别用输入过滤硬扛' },
    ],
    alternatives: ['/inputFilter'],
  },
  {
    path: '/inputFilter',
    positioning: '输入过滤指令版：v-input-filter 挂指令即可用',
    needs: [
      { text: '不想包一层组件，原生的 input 上直接限制输入', level: 'fits' },
      { text: '同一套过滤规则要应用在大量输入框上', level: 'fits', comment: '指令比组件侵入性更低' },
    ],
    alternatives: ['/component-inputFilter'],
  },
  {
    path: '/spark-upload',
    usage: {
      install: 'pnpm add spark-md5 axios',
      keyApi: ['SparkMD5.ArrayBuffer 增量哈希', 'File.slice 分片', 'Web Worker 算哈希防卡 UI', '并发控制 + 断点续传'],
      snippet: `import SparkMD5 from 'spark-md5';
const CHUNK = 5 * 1024 * 1024;
const file = input.files[0];
const chunks = Math.ceil(file.size / CHUNK);
const spark = new SparkMD5.ArrayBuffer();
for (let i = 0; i < chunks; i++) {
  const buf = await file.slice(i * CHUNK, (i + 1) * CHUNK).arrayBuffer();
  spark.append(buf); // 全量哈希用于秒传判定
}
const hash = spark.end();
// 逐片上传：POST /upload { chunk, index, hash }`,
    },
    positioning: '大文件分片上传：SparkMD5 哈希 + 分片 + 断点续传',
    needs: [
      { text: '上传几百 MB 以上的文件', level: 'fits' },
      { text: '上传中断后从断点继续', level: 'fits' },
      { text: '上传进度条与并发控制', level: 'fits' },
      { text: '秒传（服务端已有相同文件直接跳过）', level: 'partial', comment: '前端哈希已具备，秒传判定要服务端配合' },
      { text: '小文件（<5MB）直接表单上传', level: 'no', comment: '分片是过度设计，直接用 el-upload' },
    ],
    notes: ['哈希计算放 Web Worker，避免大文件卡 UI', '分片大小与并发数要和后端约定一致'],
  },
  {
    path: '/component-qr-code',
    usage: {
      install: 'pnpm add qrcode',
      keyApi: ['QRCode.toCanvas / toDataURL', 'Canvas 渲染', 'errorCorrectionLevel 容错', '带 logo 需自绘'],
      snippet: `import QRCode from 'qrcode';
await QRCode.toCanvas(canvasEl, 'https://example.com', { width: 200 });`,
    },
    positioning: '二维码生成组件：内容转二维码，Canvas 渲染',
    needs: [
      { text: '把链接/文本生成二维码展示', level: 'fits' },
      { text: '二维码带 logo、自定义颜色', level: 'partial', comment: '需在组件上扩展绘制逻辑' },
      { text: '扫码识别（从图片读码）', level: 'no', comment: '这是识别不是生成，需引入 jsQR 类库' },
    ],
    alternatives: ['/te-qrcode-view'],
  },
  {
    path: '/tree-select-transfer',
    positioning: '树形穿梭框：左侧树勾选、右侧已选平铺',
    needs: [
      { text: '从层级数据里多选一批节点', level: 'fits' },
      { text: '选择结果要展示完整路径（如「华东/上海/浦东」）', level: 'fits' },
      { text: '数据量上万节点的树选择', level: 'partial', comment: '需配合虚拟滚动改造' },
    ],
    alternatives: ['/te-department', '/te-space-select'],
  },
  {
    path: '/drag',
    positioning: '拖拽指令：v-drag 让元素可自由拖动',
    needs: [
      { text: '弹窗/悬浮球可拖拽移动', level: 'fits' },
      { text: '列表拖拽排序', level: 'no', comment: '排序场景用 sortablejs（见 pluginsLittle），别手写指令' },
    ],
  },

  /* ================= 组件库 · 业务组件 ================= */
  {
    path: '/te-drag-design',
    positioning: '拖拽表单设计器：低代码表单搭建',
    needs: [
      { text: '运营/产品自己拖拽搭表单', level: 'fits' },
      { text: '设计器产出 JSON 供渲染端动态渲染', level: 'fits' },
      { text: '复杂联动规则（跨字段显隐/取值）', level: 'partial', comment: '基础联动有，复杂规则引擎要扩展' },
    ],
  },
  {
    path: '/te-qrcode-view',
    positioning: '二维码预览业务组件：生成 + 弹窗预览 + 下载',
    needs: [
      { text: '业务对象（订单/资产）生成二维码并弹窗预览', level: 'fits' },
      { text: '批量生成后导出图片', level: 'partial', comment: '需配合批量渲染与打包下载' },
    ],
    alternatives: ['/component-qr-code'],
  },
  {
    path: '/te-print-template-view',
    positioning: '打印模板设计：可视化拖排模板 + 套打',
    needs: [
      { text: '单据/面单自定义排版打印', level: 'fits' },
      { text: '在既有纸质单据的固定位置套打', level: 'fits', comment: '模板坐标按毫米定位' },
      { text: '浏览器静默打印免弹窗', level: 'partial', comment: '浏览器限制，需客户端/打印服务配合' },
    ],
    alternatives: ['/te-print-one-code', '/te-print-qr'],
  },
  {
    path: '/te-print-one-code',
    positioning: '一码通打印：一维条码批量打印',
    needs: [
      { text: '资产/物料条码（一维码）批量打印', level: 'fits' },
      { text: '打印内容含多个可变字段', level: 'fits' },
    ],
    alternatives: ['/te-print-template-view'],
  },
  {
    path: '/te-print-qr',
    positioning: '多打印机分发打印：按打印机分流任务',
    needs: [
      { text: '多台打印机按规则分流打印任务', level: 'fits' },
      { text: '不同区域/产线各自出标签', level: 'fits' },
      { text: '打印任务状态回执追踪', level: 'partial', comment: '回执依赖打印服务能力' },
    ],
  },
  {
    path: '/te-title',
    positioning: '头衔选择：人员头衔/称谓的级联选择',
    needs: [{ text: '表单里选择职级/头衔并带回编码', level: 'fits' }],
  },
  {
    path: '/te-department',
    positioning: '部门选择：组织架构树选人/选部门',
    needs: [
      { text: '按组织架构选择部门（单选/多选）', level: 'fits' },
      { text: '选人并区分「仅本人 / 含子部门」语义', level: 'fits' },
      { text: '组织架构数据来自非本公司接口', level: 'partial', comment: '数据源适配层要重写' },
    ],
    alternatives: ['/tree-select-transfer', '/te-employee-scope-v2'],
  },
  {
    path: '/te-employee-group',
    positioning: '员工组管理：常用人组的增删改查',
    needs: [
      { text: '把常用的选人结果存成组，下次复用', level: 'fits' },
      { text: '组内成员变更留痕', level: 'partial', comment: '需要后端记录' },
    ],
  },
  {
    path: '/te-employee-scope-v2',
    positioning: '员工范围选择 v2：范围语义（本人/本部门/自定义）建模',
    needs: [
      { text: '权限/流程里选「作用范围」而不是具体人', level: 'fits' },
      { text: '范围语义与后端权限模型对接', level: 'fits' },
    ],
    alternatives: ['/te-department'],
  },
  {
    path: '/te-space-select',
    positioning: '空间级联选择：楼宇/楼层/房间的级联',
    needs: [
      { text: '按建筑空间层级逐级选择位置', level: 'fits' },
      { text: '空间数据规模大、层级深', level: 'fits', comment: '懒加载子节点' },
    ],
    alternatives: ['/te-space-zone-tree'],
  },
  {
    path: '/te-space-attribute',
    positioning: '空间属性：空间对象的自定义属性配置与展示',
    needs: [{ text: '空间档案要挂自定义扩展字段', level: 'fits' }],
  },
  {
    path: '/te-space-zone-tree',
    positioning: '分区树：空间内再划分区域（如厂区分区）的树管理',
    needs: [
      { text: '空间内部还有自定义分区层级', level: 'fits' },
      { text: '分区与设备/资产的挂接', level: 'partial', comment: '挂接关系由业务侧维护' },
    ],
  },
  {
    path: '/te-project-select',
    positioning: '项目选择：跨项目/跨组织的项目检索选择',
    needs: [{ text: '表单中选择项目并回显项目信息', level: 'fits' }],
  },
  {
    path: '/te-icon-lib',
    positioning: '图标库：站内图标的统一浏览与复制',
    needs: [
      { text: '找站内可用图标并复制组件用法', level: 'fits' },
      { text: '新增品牌图标入库', level: 'partial', comment: '需补充 svg 与注册流程' },
    ],
  },

  /* ================= 可视化 & 3D ================= */
  {
    path: '/echarts',
    positioning: 'ECharts 常规图表集合：折线/柱/饼/仪表与疑难样式',
    needs: [
      { text: '常规统计图表（趋势、占比、排行）', level: 'fits' },
      { text: '长标签饼图、断点轴、堆叠柱等疑难样式', level: 'fits' },
      { text: '图表主题定制与暗黑适配', level: 'fits' },
      { text: '大屏地球/3D 效果', level: 'no', comment: '用 threejs / echarts-gl 方向，见 3D 组' },
    ],
    alternatives: ['/vchart'],
  },
  {
    path: '/echarts-map',
    usage: {
      install: 'pnpm add echarts',
      keyApi: ['echarts.init', 'registerMap 注册 geojson', 'series.type=map/scatter/lines', '省份下钻：切 map + setOption'],
      snippet: `import * as echarts from 'echarts';
import geoJson from './china.json';
echarts.registerMap('china', geoJson);
const chart = echarts.init(el);
chart.setOption({
  series: [{ type: 'map', map: 'china', data: [{ name: '广东', value: 100 }] }],
});`,
    },
    positioning: 'ECharts 地图可视化大屏：全国视角 + 省份下钻，2D 地图 + 散点 + 视觉映射',
    needs: [
      { text: '全国范围的数据分布大屏', level: 'fits' },
      { text: '地图省份下钻', level: 'fits' },
      { text: '立体/3D 地图板块', level: 'no', comment: '用 /threejs-china-3d-map' },
    ],
    alternatives: ['/threejs-china-3d-map'],
  },
  {
    path: '/echarts-province',
    positioning: '已并入 /echarts-map（全国→省份下钻视角），保留历史别名',
    needs: [
      { text: '单省/单市粒度的地图数据展示', level: 'fits', comment: '由 /echarts-map 省份视角承载' },
      { text: 'geojson 按需加载省份边界', level: 'fits', comment: '由 /echarts-map 省份视角承载' },
    ],
    alternatives: ['/echarts-map'],
  },
  {
    path: '/vchart',
    positioning: 'VChart（VisActor）：声明式图表与叙事可视化',
    needs: [
      { text: '想要与 ECharts 对比的第二图表选型', level: 'fits' },
      { text: '声明式配置、动画叙事场景', level: 'fits' },
      { text: '团队已有大量 ECharts 积累', level: 'partial', comment: '混用两套图表库会增加包体与心智成本，选型要想清楚' },
    ],
    alternatives: ['/echarts'],
  },
  {
    path: '/canvas-advance',
    positioning: 'Canvas 2D 绘图进阶：原生画布动画与绘制技巧',
    needs: [
      { text: '不上图表库、纯 Canvas 画定制图形/动画', level: 'fits' },
      { text: 'Canvas 性能优化（离屏、分层）', level: 'fits' },
      { text: 'SVG 场景', level: 'no', comment: '本页只覆盖 Canvas 2D' },
    ],
  },
  {
    path: '/data-vis-g6',
    usage: {
      install: 'pnpm add @antv/g6',
      keyApi: ['new G6.Graph({ container, layout })', 'node/edge 数据驱动', '交互：drag-node/zoom-canvas', '大规模图需性能模式'],
      snippet: `import G6 from '@antv/g6';
const graph = new G6.Graph({
  container: el,
  layout: { type: 'force' },
  defaultNode: { type: 'circle' },
});
graph.data({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }] });
graph.render();`,
    },
    positioning: 'G6 拓扑图：节点关系/流程图可视化',
    needs: [
      { text: '拓扑/依赖/流程关系图展示', level: 'fits' },
      { text: '节点自定义样式与交互（框选/缩放）', level: 'fits' },
      { text: '超大规模图（上万节点）', level: 'partial', comment: '需开启 G6 性能模式并简化交互' },
    ],
  },
  {
    path: '/threejs-lab',
    positioning: 'Three.js 入门合集：场景/相机/渲染器/光照/动画基础',
    needs: [
      { text: '从零接入 Three.js 渲染管线', level: 'fits', comment: '含 basic/scene/sun 三个递进标签' },
      { text: '理解 WebGL 渲染循环与资源释放', level: 'fits', comment: '已补 dispose 清理，可参考写法' },
    ],
    alternatives: ['/babylon-lab'],
  },
  {
    path: '/threejs-galaxy',
    positioning: 'Three.js 粒子银河系：万级粒子与色彩渐变',
    needs: [
      { text: '炫酷的粒子背景/开场动画', level: 'fits' },
      { text: '大规模粒子性能优化思路', level: 'fits' },
    ],
  },
  {
    path: '/threejs-raycaster',
    positioning: 'Three.js 交互拾取：射线检测、点击选中、悬浮高亮',
    needs: [
      { text: '3D 场景里点击选中物体', level: 'fits' },
      { text: '鼠标悬浮提示与高亮', level: 'fits' },
      { text: '拖拽 3D 物体', level: 'partial', comment: '需配合 TransformControls 自行扩展' },
    ],
  },
  {
    path: '/threejs-model-inspector',
    usage: {
      install: 'pnpm add three  # 示例模型来自 Khronos glTF-Sample-Assets(CC0/CC-BY)',
      keyApi: [
        'GLTFLoader + DRACOLoader(懒加载解码器)',
        'PMREMGenerator.fromScene(new RoomEnvironment()) 程序化 IBL，免 .hdr',
        '材质三态: wireframe / transparent+depthWrite=false(X 光)',
        'AnimationMixer.clipAction(clip).play() 骨骼动画',
        'UnrealBloomPass 后期泛光(enabled 切换，末位 pass 自动直出)',
        'TransformControls.getHelper() 挂场景，dragging-changed 时禁用 OrbitControls',
      ],
      snippet: `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const loader = new GLTFLoader();
const gltf = await loader.loadAsync('/models/DamagedHelmet.glb');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;`,
      demoPath: '/threejs-model-inspector',
    },
    positioning: 'Three.js 3D 模型检视台：glTF 加载 + PBR/IBL + 阴影 + 材质三态 + 拾取 + 动画 + 泛光 + 变换',
    needs: [
      { text: '在网页里加载并展示真实 3D 模型', level: 'fits', comment: '自带破损头盔/玩具车/狐狸三套免费模型' },
      { text: '做产品/藏品 3D 展示与材质对比', level: 'fits' },
      { text: '骨骼动画预览与播放控制', level: 'fits' },
      { text: '不想自己搭 three 基建只想快速看模型', level: 'fits' },
    ],
    notes: [
      '内置模型放 public/models/，运行时由 GLTFLoader 拉取，不进打包产物',
      '颜色管线沿用 three-compat(关 ColorManagement)，与站内其余 three 示例一致',
      '组件本体在 src/components/three-model-viewer，可作为通用查看器复用',
    ],
    alternatives: ['/threejs-raycaster', '/threejs-china-3d-map'],
  },
  {
    path: '/threejs-iot-scene',
    usage: {
      install: 'pnpm add three  # 设备全程序化生成，无需任何外部模型/贴图',
      keyApi: [
        'CSS2DRenderer + CSS2DObject 把 HTML 标签钉在 3D 锚点（即「绑点」浮窗）',
        'OrbitControls(enableDamping + autoRotate) 轨道环视',
        '用基础几何体(Box/Cylinder/Torus/Sphere)过程化搭电机/泵/阀/罐/传送带',
        '响应式数据总线(reactive) 600ms 平滑逼近 + 噪声，逐帧 lerp 驱动运转',
        '阈值越界 → alarms computed → 设备壳体 emissive 转红 + 标签红色描边',
        'MeshStandardMaterial 阴影 + Hemisphere/Directional/Point 灯光',
      ],
      snippet: `import { createIotScene } from '@/components/three-iot-scene/src/useIotScene';
const h = createIotScene(el);
h.setScenario('alarm'); // normal | alarm | stop`,
      demoPath: '/threejs-iot-scene',
    },
    positioning: 'Three.js 物联网 3D 组态：程序化设备 + 实时数据总线 + 浮动绑点 + 运转动画 + 阈值报警',
    needs: [
      { text: '做工业/物联网组态大屏，设备随实时数据运转', level: 'fits', comment: '电机转/泵叶轮转/阀手轮转角/罐液位/传送带移动/传感器脉冲' },
      { text: '把数据标签「绑」到 3D 设备并显示实时值', level: 'fits', comment: 'CSS2D 浮动绑点 + 绑点明细表' },
      { text: '演示告警态（超温/超压/卡阀/高液位）可视化', level: 'fits' },
      { text: '需要加载真实工业设备模型', level: 'partial', comment: '当前设备为过程化几何体，非扫描/建模模型' },
    ],
    notes: [
      '数据总线是模块级单例(src/components/three-iot-scene/dataBus.ts)，组件与页面共享',
      '颜色管线沿用 three-compat(关 ColorManagement)，outputColorSpace=LinearSRGB',
      '卸载时全量 dispose 几何体/材质/控制器/渲染器，并 stopBus()',
    ],
    alternatives: ['/threejs-model-inspector', '/echarts-map'],
  },
  {
    path: '/iot-config-editor',
    usage: {
      install: 'pnpm add three  # 仅编辑器自身零依赖：纯 SVG + Vue + Pinia 化 reactive 数据总线',
      keyApi: [
        '元件库 → 画布：HTML5 pointer 事件拖拽 + getScreenCTM().inverse() 把屏幕坐标映射到 SVG viewBox',
        '设备节点 DeviceNode.vue 用基础 SVG 形状过程化绘制，rAF 按绑定值驱动扇叶/叶轮/液位/皮带/脉冲',
        '绑点连线：从设备端口 pointerdown 拉贝塞尔曲线到另一设备，Wire 存 from/to 持久化',
        '实时数据总线(dataBus.ts) 600ms 平滑逼近 + 噪声，watch/computed 派生状态与报警',
        '布局存 localStorage，刷新可恢复；绑定点可在属性面板切换数据点',
      ],
      snippet: `<IotConfigEditor />  // 直接用，自带元件库/画布/属性面板/场景切换
// 拖设备入画布 → 拖端口连线 → 顶部切「正常/告警/停机」看运转与报警`,
      demoPath: '/iot-config-editor',
    },
    positioning: '物联网组态编辑器（2D SVG）：拖拽搭建设备 + 绑点连线 + 实时数据驱动运转',
    needs: [
      { text: '做可拖拽的组态/SCADA 编辑器，而非固定大屏', level: 'fits', comment: '元件库拖入、自由布局、连线、属性面板' },
      { text: '把数据点「绑」到设备并显示实时绑点值', level: 'fits', comment: '属性面板可切绑定 tag，节点实时显示数值' },
      { text: '演示设备随实时数据运转（转/升降/移动/脉冲）', level: 'fits', comment: 'rAF 按 dataBus 值驱动，零模型零贴图' },
      { text: '需要加载真实工业 CAD 模型', level: 'no', comment: '设备为 SVG 过程化图形，非 3D 模型' },
    ],
    notes: [
      '与 /threejs-iot-scene 共用同一份 dataBus 单例，两套页面数据/场景联动一致',
      '设备节点动画走 rAF 直接改 SVG transform，不经 Vue 响应式，避免逐帧重渲染',
      '画布坐标用 getScreenCTM().inverse() 反算，缩放/letterbox 下拖拽依然精准',
    ],
    alternatives: ['/threejs-iot-scene', '/workflow-designer'],
  },
  {
    path: '/threejs-china-3d-map',
    usage: {
      install: 'pnpm add three @types/three',
      keyApi: ['camera.up.set(0,0,1) 立起来', 'OrbitControls 限幅防翻面', '下钻=重建地图（fitProjection）', '数据柱用竖直 billboard 而非 Cylinder'],
      snippet: `import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
camera.up.set(0, 0, 1); // 地图躺在 XY 平面，Z 朝上
const renderer = new THREE.WebGLRenderer({ antialias: true });`,
    },
    positioning: 'Three.js 中国 3D 地图（重制版）：立体板块/飞线/下钻/书签/测量',
    needs: [
      { text: '指挥大屏的 3D 中国地图', level: 'fits' },
      { text: '省市下钻 + 飞线 + 散点 + 时间轴', level: 'fits' },
      { text: '快速出效果不要求可维护', level: 'no', comment: '2D 用 echarts-map 更便宜' },
    ],
    notes: ['体量大（约 2000 行），二开前先读 mapConfig 与图层分层', '涟漪/飞线贴图必须标 userData.shared 防止误释放'],
    alternatives: ['/echarts-map'],
  },
  {
    path: '/babylon-lab',
    positioning: 'Babylon.js 基础合集：引擎/几何/参数化/材质',
    needs: [
      { text: '对比 Three.js 的另一 3D 引擎选型', level: 'fits', comment: 'Babylon 引擎层封装更厚，游戏向场景更省事' },
      { text: '几何体创建与材质贴图快速上手', level: 'fits' },
    ],
    alternatives: ['/threejs-lab'],
  },
  {
    path: '/babylon-flame',
    positioning: 'Babylon 粒子火焰：粒子系统与发射器',
    needs: [{ text: '火焰/烟雾/爆炸类粒子特效', level: 'fits' }],
  },
  {
    path: '/babylon-pbr',
    positioning: 'Babylon PBR 材质：基于物理的渲染',
    needs: [{ text: '金属/玻璃等写实材质表现', level: 'fits' }],
  },

  /* ================= 工程能力 ================= */
  {
    path: '/network-axios',
    usage: {
      install: '内置（src/services/http 可整目录复制，仅依赖 axios）',
      keyApi: ['拦截器双分类 BizError/HttpError', '401 重试一次（仅幂等）', 'getCode/getMessage/successCodes 适配后端', 'token-manager 自动刷新'],
      snippet: `import { createHttpClient } from '@/services/http';
const http = createHttpClient({ baseURL: '/api' });
const { data } = await http.get('/user');
// 业务码非 0 抛 BizError，网络/状态码问题抛 HttpError`,
    },
    positioning: 'Axios 请求封装模板：拦截器/错误分类/401 重试，可整目录复制',
    needs: [
      { text: '新项目搭一套统一的请求层', level: 'fits', comment: 'src/services/http 可整目录复制，只依赖 axios' },
      { text: '业务错误与网络错误分开处理', level: 'fits', comment: 'BizError / HttpError 双分类' },
      { text: 'token 过期自动刷新重试', level: 'fits', comment: '401 重试一次，仅幂等方法' },
      { text: 'GraphQL / 流式请求', level: 'no', comment: '模板只覆盖 REST' },
    ],
    notes: ['配置速查与 6 条反模式见 src/services/http/README.md'],
  },
  {
    path: '/network-websocket',
    positioning: 'WebSocket 通信：连接管理、心跳、重连',
    needs: [
      { text: '服务端主动推送的实时消息（通知/行情/聊天）', level: 'fits' },
      { text: '断线自动重连 + 心跳保活', level: 'fits' },
      { text: '只是 AI 回复的流式打字', level: 'no', comment: '单向下行用 SSE 更省，见 network-sse' },
    ],
    alternatives: ['/network-sse'],
  },
  {
    path: '/network-sse',
    usage: {
      install: '内置（EventSource 原生，无需安装）',
      keyApi: ['new EventSource(url) 单向下行', 'onmessage / addEventListener 事件名', 'AI 流式：逐块 append', '双向用 WebSocket'],
      snippet: `const es = new EventSource('/api/stream');
es.onmessage = (e) => {
  if (e.data === '[DONE]') return es.close();
  output.value += e.data; // 流式打字机
};`,
    },
    positioning: 'SSE 流式数据：服务端单向推送，AI 回复流式输出的标配',
    needs: [
      { text: 'AI 对话的流式打字机效果', level: 'fits' },
      { text: '服务端日志/进度实时下发的轻量推送', level: 'fits', comment: '比 WebSocket 轻，HTTP 即可' },
      { text: '客户端向服务端持续发消息', level: 'no', comment: 'SSE 单向，双向用 WebSocket' },
    ],
    alternatives: ['/network-websocket'],
  },
  {
    path: '/network-webrtc',
    positioning: 'WebRTC 音视频：点对点实时通信',
    needs: [
      { text: '浏览器摄像头/麦克风采集与点对点传输', level: 'fits' },
      { text: '屏幕共享', level: 'partial', comment: 'getDisplayMedia 需自行接入' },
      { text: '多人会议', level: 'no', comment: '需要 SFU 服务器，P2P 撑不住' },
    ],
  },
  {
    path: '/demo',
    positioning: 'Chrome TTS 语音播报：speechSynthesis 朗读文本',
    needs: [
      { text: '告警/排队叫号类语音播报', level: 'fits' },
      { text: '离线高自然度语音合成', level: 'no', comment: '系统 TTS 音色有限，高质量需云端 TTS' },
    ],
    notes: ['不同浏览器音色差异大，语速/音调要实测'],
  },
  {
    path: '/form-rich-editor',
    usage: {
      install: 'pnpm add @tiptap/vue-3 @tiptap/starter-kit',
      keyApi: ['useEditor({ extensions, content })', 'StarterKit 含基础节点', '扩展按需注册（图片/表格/字数）', 'EditorContent 渲染'],
      snippet: `import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>hello</p>',
});
// <editor-content :editor="editor" />`,
    },
    positioning: 'Tiptap 富文本编辑器： ProseMirror 内核 + 定制扩展',
    needs: [
      { text: '公告/文章类富文本编辑', level: 'fits' },
      { text: '图片/表格/任务列表/字数统计', level: 'fits' },
      { text: '粘贴 Word 保留样式、格式刷、行高', level: 'fits', comment: '扩展已写好，直接参考' },
      { text: '多人协同编辑', level: 'no', comment: '需要 Yjs + 服务端，本页未覆盖' },
    ],
    notes: ['扩展按需注册，全量引入会显著增加包体'],
  },
  {
    path: '/form-image-crop',
    positioning: '图片裁剪上传：裁剪交互 + 压缩 + 上传',
    needs: [
      { text: '头像/图片素材裁剪后上传', level: 'fits' },
      { text: '裁剪后前端压缩控制体积', level: 'fits' },
    ],
  },
  {
    path: '/form-signature',
    positioning: '手写签名：Canvas 签名板，笔迹平滑与导出',
    needs: [
      { text: '电子签名/确认单手写', level: 'fits' },
      { text: '移动端触屏签名', level: 'fits' },
      { text: '法律级电子签章', level: 'no', comment: '需 CA 服务，本页只解决笔迹采集' },
    ],
  },
  {
    path: '/form-excel-data-entry-vxe',
    usage: {
      install: 'pnpm add vxe-table vxe-pc-ui xe-utils',
      keyApi: ['app.use(VxeTable).use(VxeUI)', 'column type=seq/edit/render', 'edit-rules 校验', '单元格区域选取是 pro（OSS 需自研）'],
      snippet: `import { VxeUI, VxeTable } from 'vxe-table';
import 'vxe-table/lib/style.css';
import 'vxe-pc-ui/lib/style.css';
app.use(VxeTable).use(VxeUI);
// <vxe-table :data="rows" :edit-rules="rules">
//   <vxe-column type="seq" width="60" />
//   <vxe-column field="name" title="名称" :edit-render="{}" />
// </vxe-table>`,
    },
    positioning: 'Excel 数据录入台（vxe-table）：单元格编辑/校验/序列填充/查找替换/历史',
    needs: [
      { text: '批量录入数据的 Excel 式体验（编辑+校验+标红）', level: 'fits' },
      { text: '序列填充、批量粘贴、查找替换', level: 'fits' },
      { text: '操作历史与撤销', level: 'fits' },
      { text: '多人协同编辑同一张表', level: 'no', comment: '纯前端实现，协同要自建协议' },
      { text: '导出为真实 Excel 文件', level: 'partial', comment: '配合 /form-export-to-excel' },
    ],
    alternatives: ['/plugins-jspreadsheet-ce', '/form-export-to-excel'],
  },
  {
    path: '/form-export-to-excel',
    usage: {
      install: 'pnpm add exceljs file-saver',
      keyApi: ['new ExcelJS.Workbook()', 'worksheet.columns / addRow', 'mergeCells 表头合并', 'workbook.xlsx.writeBuffer() + saveAs'],
      snippet: `import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('报表');
ws.columns = [{ header: '名称', key: 'name', width: 20 }];
ws.addRow({ name: '示例' });
const buf = await wb.xlsx.writeBuffer();
saveAs(new Blob([buf]), 'report.xlsx');`,
    },
    positioning: 'Excel 导出（exceljs）：样式/合并/多 sheet 的纯前端导出',
    needs: [
      { text: '列表数据导出 Excel（含样式/表头合并）', level: 'fits' },
      { text: '大数据量导出（万行级）', level: 'partial', comment: '注意内存，必要时改服务端导出' },
      { text: '读取用户上传的 Excel 做解析', level: 'partial', comment: 'exceljs 也能读，本页侧重导出' },
    ],
    alternatives: ['/form-excel-data-entry-vxe'],
  },
  {
    path: '/plugin-word-pdf-preview',
    usage: {
      install: 'pnpm add @vue-office/docx @vue-office/excel @vue-office/pdf',
      keyApi: ['VueOfficeDocx / Excel / Pdf 组件', ':src 传地址或 ArrayBuffer', '纯前端解析不上传第三方', '@vue-office/* 需 onlyBuiltDependencies'],
      snippet: `import VueOfficePdf from '@vue-office/pdf';
import '@vue-office/pdf/lib/index.css';
// <vue-office-pdf :src="fileUrl" @rendered="onRendered" />`,
    },
    positioning: 'Word/PDF/Excel 文件预览与下载（vue-office 全家桶）',
    needs: [
      { text: '在线预览 docx/xlsx/pdf，不上传第三方', level: 'fits' },
      { text: '文件下载与重命名', level: 'fits' },
      { text: '预览超大文件（百页 PDF）', level: 'partial', comment: '加载耗时明显，考虑分页/缩略图' },
    ],
  },
  {
    path: '/plugins-jspreadsheet-ce',
    usage: {
      install: 'pnpm add jspreadsheet-ce jsuites',
      keyApi: ['jspreadsheet(el, { data, columns })', '列类型/公式', 'CE 免费，高级功能在付费版', '与 vxe 二选一'],
      snippet: `import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
jspreadsheet(el, {
  data: [['A1', 'B1']],
  columns: [{ type: 'text', title: '名称', width: 120 }],
});`,
    },
    positioning: 'jspreadsheet-ce 在线表格：轻量类 Excel 电子表格',
    needs: [
      { text: '页面内嵌轻量在线表格（公式/列类型）', level: 'fits' },
      { text: '与 vxe-table 二选一怎么选', level: 'partial', comment: '重录入校验用 vxe，重电子表格公式用 jspreadsheet' },
      { text: '免费商用', level: 'fits', comment: 'CE 版免费，但高级功能在付费版' },
    ],
    alternatives: ['/form-excel-data-entry-vxe'],
  },
  {
    path: '/vue3SlideVerify',
    usage: {
      install: 'pnpm add vue3-slide-verify',
      keyApi: ['<slide-verify :l :r :w :h>', 'success/again/refresh 事件', '前端体验层，风控靠服务端'],
      snippet: `import SlideVerify from 'vue3-slide-verify';
// <slide-verify :l="42" :r="9" :w="320" :h="160" @success="onSuccess" />`,
    },
    positioning: '滑块验证码：vue3-slide-verify 人机校验',
    needs: [
      { text: '登录/提交前的滑块人机验证', level: 'fits' },
      { text: '企业级防刷风控', level: 'no', comment: '前端滑块只是体验层，风控要服务端' },
    ],
  },
  {
    path: '/plugins-vueuse',
    usage: {
      install: 'pnpm add @vueuse/core',
      keyApi: ['useDebounceFn / useThrottleFn', 'useClipboard / useLocalStorage', 'useElementSize / useIntersectionObserver', '先查 VueUse 再手写'],
      snippet: `import { useClipboard, useDebounceFn } from '@vueuse/core';
const { copy, copied } = useClipboard();
const onResize = useDebounceFn(() => console.log('resized'), 200);`,
    },
    positioning: 'VueUse 组合式函数集：常用 hooks 的速查与演示',
    needs: [
      { text: '防抖监听/元素尺寸/剪贴板/本地存储等常见 hook', level: 'fits', comment: '先查 VueUse 再手写' },
      { text: '决定哪些场景自己封装 hook', level: 'fits', comment: '对照演示页看边界' },
    ],
  },
  {
    path: '/plugins-draggable-formula',
    positioning: '拖拽公式编辑：字段拖入拼装计算公式',
    needs: [
      { text: '指标/计价规则的可视化公式配置', level: 'fits' },
      { text: '公式语法解析与错误提示', level: 'partial', comment: '解析层要按业务扩展' },
    ],
  },
  {
    path: '/pluginsLittle',
    positioning: '小插件合集：拖拽排序、复制、水印等零散实用件',
    needs: [
      { text: '列表拖拽排序（sortablejs）', level: 'fits' },
      { text: '页面水印（防截图泄露）', level: 'fits', comment: '前端水印可被删，强需求要服务端渲染' },
      { text: '其他一次性小需求', level: 'fits' },
    ],
  },
  {
    path: '/data-platform-metric-catalog',
    positioning: '数据指标口径管理：指标定义/口径/血缘的管理界面',
    needs: [
      { text: '指标口径的登记与检索界面参考', level: 'fits' },
      { text: '指标血缘图谱可视化', level: 'partial', comment: '图谱部分需配合 G6' },
    ],
    alternatives: ['/data-vis-g6'],
  },

  /* ================= Vue 深入 ================= */
  {
    path: '/vue3-core-lab',
    positioning: 'Vue3 核心特性合集：Teleport / Suspense / provide-inject / watch 对比',
    needs: [
      { text: '弹层渲染到 body 但作用域留在组件内（Teleport）', level: 'fits' },
      { text: '异步组件的加载态与错误态统一处理（Suspense）', level: 'fits' },
      { text: '深层组件传值不想一层层 props（provide/inject）', level: 'fits' },
      { text: 'watch / watchEffect 深度/立即/清理到底怎么选', level: 'fits' },
    ],
  },
  {
    path: '/store-perf-lab',
    positioning: '状态与性能合集：Pinia 持久化 / Setup Store / KeepAlive / 异步组件',
    needs: [
      { text: '登录态/主题等状态刷新不丢（Pinia 持久化）', level: 'fits' },
      { text: 'Store 用 options 还是 setup 风格', level: 'fits', comment: '对比页直接看差异' },
      { text: '列表页返回保留滚动与筛选条件（KeepAlive）', level: 'fits' },
      { text: '首屏体积优化，路由级懒加载', level: 'fits' },
    ],
  },
  {
    path: '/utils-lab',
    positioning: '工具函数合集：深拷贝 / 防抖节流 / 事件总线 / 剪贴板 / IndexedDB',
    needs: [
      { text: '深拷贝含循环引用/特殊类型怎么处理', level: 'fits' },
      { text: '防抖节流手写原理与 lodash 差异', level: 'fits' },
      { text: '非父子组件通信（mitt 事件总线）', level: 'fits', comment: '能用但不滥用，状态归 pinia' },
      { text: '复制文本到剪贴板的兼容写法', level: 'fits' },
      { text: '浏览器端存大量结构化数据（IndexedDB）', level: 'fits', comment: 'localStorage 存不下的场景' },
    ],
  },

  /* ================= 样式与动效 ================= */
  {
    path: '/css-layout-lab',
    positioning: 'CSS 布局合集：Grid / Flex / 响应式 / 语义化标签',
    needs: [
      { text: '二维网格布局（Grid）与一维流式布局（Flex）怎么选', level: 'fits' },
      { text: '多端适配的响应式断点方案', level: 'fits' },
      { text: 'HTML 标签语义化与命名规范', level: 'fits' },
    ],
  },
  {
    path: '/css-effects-lab',
    positioning: 'CSS 效果合集：关键帧动画 / 毛玻璃 / 变量主题 / 层叠 / 伪元素 / 换行',
    needs: [
      { text: 'CSS 动画替代 JS 动画（性能更好）', level: 'fits' },
      { text: 'backdrop-filter 毛玻璃与降级方案', level: 'fits' },
      { text: 'CSS 变量做暗黑主题/换肤', level: 'fits', comment: '本站主题就是这套实现' },
      { text: 'z-index 混乱的治理', level: 'fits' },
      { text: '文本溢出换行的各种姿势', level: 'fits' },
    ],
  },
  {
    path: '/animations',
    positioning: '动画大全：关键帧/过渡/微交互动效合集',
    needs: [
      { text: '找加载/转场/反馈类动效参考', level: 'fits' },
      { text: '抽奖转盘、购物车抛物线等复合动画', level: 'fits' },
      { text: '复杂物理动画', level: 'no', comment: '上 gsap（见 /gsap-animation）' },
    ],
  },

  /* ================= 补缺新增（2026-10 缺口盘点） ================= */
  {
    path: '/permission',
    positioning: '权限方案：v-permission 指令 + 权限码模型 + 路由守卫',
    needs: [
      { text: '按钮按角色显隐/置灰', level: 'fits', comment: '指令双形态：remove 与 disable' },
      { text: '菜单/路由按权限过滤', level: 'fits', comment: '路由 meta.permission + beforeEach 守卫' },
      { text: '后端接口鉴权', level: 'no', comment: '前端权限只是体验层，防线永远在服务端' },
    ],
  },
  {
    path: '/workflow-designer',
    usage: {
      install: 'pnpm add @logicflow/core',
      keyApi: ['new LogicFlow({ container, grid })', 'render 画布', 'getGraphData() 导出 JSON 协议', 'register 自定义节点'],
      snippet: `import LogicFlow from '@logicflow/core';
const lf = new LogicFlow({ container: el, grid: true });
lf.render({ nodes: [{ id: '1', type: 'rect', x: 100, y: 100 }], edges: [] });
const graph = lf.getGraphData(); // 设计结果即协议`,
    },
    positioning: '审批流设计器（LogicFlow）：节点编排 + JSON 协议导入导出',
    needs: [
      { text: '可视化设计审批/工单流转流程', level: 'fits' },
      { text: '设计结果存 JSON、渲染端动态执行', level: 'fits', comment: 'getGraphData 即协议' },
      { text: '复杂条件分支与并行网关', level: 'partial', comment: '基础节点齐，网关要扩展节点注册' },
    ],
    alternatives: ['/data-vis-g6'],
  },
  {
    path: '/gantt-schedule',
    usage: {
      install: 'pnpm add frappe-gantt',
      keyApi: ['new Gantt(selector, tasks, options)', 'task: { id, name, start, end }', 'view_mode: Day/Week/Month', 'on_click/on_date_change 回调'],
      snippet: `import Gantt from 'frappe-gantt';
new Gantt('#gantt', [
  { id: '1', name: '排期', start: '2026-10-21', end: '2026-10-25' },
], { view_mode: 'Week', on_click: (t) => console.log(t) });`,
    },
    positioning: '甘特图排期（frappe-gantt）：任务条拖拽改期 + 进度',
    needs: [
      { text: '项目排期可视化、拖拽调整日期', level: 'fits' },
      { text: '季度/周/日多种粒度切换', level: 'fits' },
      { text: '资源负载、依赖折叠等重型能力', level: 'partial', comment: 'frappe 轻量有限，重需求上 dhtmlx-gantt（注意商用许可）' },
    ],
  },
  {
    path: '/ai-chat',
    positioning: 'AI 对话界面：多会话 + 流式输出 + Markdown 分块渲染',
    needs: [
      { text: '中后台嵌 AI 助手对话', level: 'fits', comment: '消息协议与真实 SSE 对齐，换 fetch 读流即接入' },
      { text: '流式过程中的代码块/加粗渲染', level: 'fits' },
      { text: '长上下文管理、对话记忆持久化', level: 'partial', comment: '会话结构已具备，持久化接后端即可' },
    ],
    alternatives: ['/network-sse'],
  },
  {
    path: '/speech-recognition',
    positioning: '语音识别 + 录音：SpeechRecognition 实时转写 + MediaRecorder 采集',
    needs: [
      { text: '语音输入工单/搜索（Chromium）', level: 'fits', comment: 'interim 实时 + final 定稿' },
      { text: '语音留言采集上传', level: 'fits', comment: 'webm/opus，Safari 为 mp4 需按 mimeType 处理' },
      { text: 'Firefox/Safari 实时识别', level: 'no', comment: '需降级录音 + 云端转写' },
    ],
    alternatives: ['/demo'],
  },
  {
    path: '/screenshot-capture',
    usage: {
      install: 'pnpm add html2canvas',
      keyApi: ['html2canvas(dom).then(canvas)', 'useCORS 跨域图', '平铺水印叠加', '与 /pdf-export 共用'],
      snippet: `import html2canvas from 'html2canvas';
const canvas = await html2canvas(cardEl, { useCORS: true, scale: 2 });
const url = canvas.toDataURL('image/png'); // 生成分享图 / 留痕截图`,
    },
    positioning: '页面截图（html2canvas）：DOM 转 PNG + 平铺水印',
    needs: [
      { text: '报表卡片生成分享图', level: 'fits' },
      { text: '带水印的证据/留痕截图', level: 'fits' },
      { text: '跨域图片截取', level: 'partial', comment: '需 useCORS + 服务端 CORS 头' },
    ],
    alternatives: ['/pdf-export'],
  },
  {
    path: '/pdf-export',
    usage: {
      install: 'pnpm add html2canvas',
      keyApi: ['@media print 矢量打印方案零依赖', 'html2canvas(dom) 截图导出', '跨域图需 useCORS', '真矢量中文需 pdfmake 嵌字体'],
      snippet: `import html2canvas from 'html2canvas';
const canvas = await html2canvas(el, { useCORS: true });
document.body.appendChild(canvas); // 截图导出 / 带水印`,
    },
    positioning: 'PDF 生成双路线：@media print 矢量打印 + html2canvas 截图导出',
    needs: [
      { text: '回单/报告导出 PDF（中文无字体负担）', level: 'fits', comment: '打印样式方案矢量且零依赖' },
      { text: '富样式票据所见即所得导出', level: 'fits', comment: 'html2canvas 转图，文字不可选' },
      { text: '真矢量中文 PDF', level: 'partial', comment: 'pdfmake 需嵌入约 10MB CJK 字体，慎选' },
    ],
    alternatives: ['/screenshot-capture', '/form-export-to-excel'],
  },
  {
    path: '/code-editor',
    usage: {
      install: 'pnpm add codemirror @codemirror/state @codemirror/view @codemirror/lang-javascript',
      keyApi: ['EditorState.create({ doc, extensions })', 'EditorView 挂载 DOM', 'updateListener 监听变更', '按扩展拼装（语言/主题）'],
      snippet: `import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
const view = new EditorView({
  state: EditorState.create({ doc: 'const a = 1', extensions: [javascript(), keymap.of([])] }),
  parent: el,
});`,
    },
    positioning: '代码编辑器（CodeMirror 6）：轻量、按扩展拼装',
    needs: [
      { text: '配置/脚本/SQL 在线编辑', level: 'fits' },
      { text: '文档变化监听（字数/校验/草稿）', level: 'fits', comment: 'updateListener' },
      { text: '重 IDE 能力（调试/断点）', level: 'no', comment: '那是 Monaco 的领地，包体差一个量级' },
    ],
  },
  {
    path: '/api-mock',
    positioning: '接口 Mock：axios adapter 层接管 + 开关/延迟模拟',
    needs: [
      { text: '后端未就绪时前端先行开发', level: 'fits' },
      { text: '演示/评审环境模拟接口数据', level: 'fits' },
      { text: '契约测试、多场景切换', level: 'partial', comment: 'msw 更合适，本方案求轻' },
    ],
    alternatives: ['/network-axios'],
  },
  {
    path: '/unit-test',
    positioning: '单元测试示例（Vitest）：纯逻辑用例的写法与运行',
    needs: [
      { text: '把「改了怕坏的纯逻辑」圈进测试', level: 'fits' },
      { text: '假时钟测防抖节流等异步逻辑', level: 'fits', comment: 'vi.useFakeTimers' },
    ],
  },
  {
    path: '/gsap-animation',
    positioning: 'GSAP 动画：时间轴编排 / stagger 批量入场',
    needs: [
      { text: 'CSS 关键帧写不出的复杂时序动画', level: 'fits' },
      { text: '列表/卡片错峰入场（stagger）', level: 'fits' },
      { text: '滚动叙事', level: 'partial', comment: 'ScrollTrigger 同包内，需 registerPlugin' },
    ],
    alternatives: ['/animations'],
  },
  {
    path: '/mind-map',
    positioning: '思维导图（G6 mindmap 布局）：双击加节点、导出结构',
    needs: [
      { text: '需求拆解/知识结构可视化', level: 'fits', comment: '复用站内 G6，零新增依赖' },
      { text: '导入导出可编辑结构', level: 'fits', comment: 'get(data) 即 JSON 协议' },
      { text: '手绘风格/大纲编辑一体化', level: 'no', comment: '那类产品级体验用 simple-mind-map' },
    ],
    alternatives: ['/data-vis-g6'],
  },
  {
    path: '/i18n-demo',
    usage: {
      install: 'pnpm add vue-i18n',
      keyApi: ['createI18n({ locale, messages })', 't() 插值/复数', '动态 import locale 控首包', 'fallbackLocale'],
      snippet: `import { createI18n } from 'vue-i18n';
const i18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: { zh: {}, en: {} },
});`,
    },
    positioning: '国际化（vue-i18n）：插值/复数/fallback 与词表组织约定',
    needs: [
      { text: '多语言词条管理与语言切换', level: 'fits' },
      { text: '语言包按需加载控制首包体积', level: 'fits', comment: '动态 import locale 文件' },
      { text: 'RTL 语言', level: 'no', comment: '需要额外布局方案' },
    ],
  },
];

/** path → 画像 快速索引 */
const profileMap = new Map(capabilityProfiles.map((profile) => [profile.path, profile]));

export function getProfile(path: string): CapabilityProfile | undefined {
  return profileMap.get(path);
}
