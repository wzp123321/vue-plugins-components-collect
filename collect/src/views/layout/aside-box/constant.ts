/*
 * 导航结构（2026-10-20 二次收敛版）
 *
 * 旧结构：5 个能力域 → 13 个分区 → 83 个条目。
 * 新结构：5 个能力域 → 10 个分区 → 57 个菜单条目，
 *        同域小示例聚合为「合集页」（DemoHub 标签页，?tab= 可深链），
 *        被合并的示例转为 searchOnly 条目 —— 不占侧边栏，但搜索/命令面板仍可直达。
 *
 * 注意：这里只组织「导航」，不新增/删除路由。
 *      每个 path 都对应 src/router/modules/*.ts 中已存在的路由；
 *      合并前的旧路径在路由表中保留为 redirect，历史链接不断。
 */

import { semanticSearch } from '@/utils/semantic-search';

export interface NavItem {
  path: string;
  label: string;
  /** 仅参与搜索索引，不在侧边栏菜单中展示（合集页内的子示例） */
  searchOnly?: boolean;
  /** 侧边栏角标文案（合集入口展示内部子示例数） */
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavGroup {
  key: string;
  label: string;
  caption: string;
  icon: string;
  /** 分组强调色（侧边栏图标徽章与激活态点缀），不设置则用品牌色 */
  tone?: string;
  sections: NavSection[];
}

export interface FlatNavItem extends NavItem {
  groupKey: string;
  groupLabel: string;
  sectionLabel: string;
}

export const navGroups: NavGroup[] = [
  {
    key: 'components',
    label: '组件库',
    caption: '通用能力与业务组件，覆盖选择器、打印、空间与人员模型',
    icon: 'components',
    tone: '#7c5cff',
    sections: [
      {
        label: '通用组件与指令',
        items: [
          { path: '/capability-map', label: '能力地图', badge: '新' },
          { path: '/component-home', label: '组件总览' },
          { path: '/component-inputFilter', label: '输入框过滤' },
          { path: '/spark-upload', label: '大文件上传' },
          { path: '/component-qr-code', label: '二维码生成' },
          { path: '/tree-select-transfer', label: '树形穿梭' },
          { path: '/inputFilter', label: '输入框过滤指令', searchOnly: true },
          { path: '/drag', label: '拖拽指令' },
        ],
      },
      {
        label: '业务组件',
        items: [
          { path: '/te-drag-design', label: '拖拽设计' },
          { path: '/te-qrcode-view', label: '二维码预览' },
          { path: '/te-print-template-view', label: '打印模板' },
          { path: '/te-print-one-code', label: '一码通打印' },
          { path: '/te-print-qr', label: '多打印机分发' },
          { path: '/te-title', label: '头衔选择' },
          { path: '/te-department', label: '部门选择' },
          { path: '/te-employee-group', label: '员工组' },
          { path: '/te-employee-scope-v2', label: '员工范围' },
          { path: '/te-space-select', label: '空间级联' },
          { path: '/te-space-attribute', label: '空间属性' },
          { path: '/te-space-zone-tree', label: '分区树' },
          { path: '/te-project-select', label: '项目选择' },
          { path: '/te-icon-lib', label: '图标库' },
        ],
      },
    ],
  },
  {
    key: 'visual',
    label: '可视化 & 3D',
    caption: 'ECharts、G6 与 Three.js / Babylon.js 的三维表达',
    icon: 'visual',
    tone: '#22d3ee',
    sections: [
      {
        label: '图表',
        items: [
          { path: '/echarts', label: 'ECharts 集合' },
          { path: '/echarts-map', label: '地图可视化大屏' },
          { path: '/echarts-province', label: '省份地图', searchOnly: true },
          { path: '/vchart', label: 'VChart 图表' },
          { path: '/canvas-advance', label: 'Canvas 绘图进阶' },
          { path: '/data-vis-g6', label: 'G6 拓扑图' },
        ],
      },
      {
        label: 'Three.js',
        items: [
          { path: '/threejs-lab', label: 'Three.js 合集', badge: '5' },
          { path: '/threejs-basic', label: '基础图形', searchOnly: true },
          { path: '/threejs-scene', label: '场景与物体', searchOnly: true },
          { path: '/threejs-sun', label: '太阳地球', searchOnly: true },
          { path: '/threejs-galaxy', label: '粒子银河系', searchOnly: true },
          { path: '/threejs-raycaster', label: '交互拾取', searchOnly: true },
          { path: '/threejs-model-inspector', label: '3D 模型检视台' },
          { path: '/threejs-china-3d-map', label: '中国 3D 地图' },
        ],
      },
      {
        label: '物联网组态',
        items: [
          { path: '/threejs-iot-scene', label: '设备运转监视(3D)' },
          { path: '/iot-config-editor', label: '组态编辑器(拖拽)' },
        ],
      },
      {
        label: 'Babylon.js',
        items: [
          { path: '/babylon-lab', label: 'Babylon 基础合集', badge: '4' },
          { path: '/babylon-base', label: '基础场景', searchOnly: true },
          { path: '/babylon-mesh', label: '几何形状', searchOnly: true },
          { path: '/babylon-params', label: '参数化建模', searchOnly: true },
          { path: '/babylon-texture', label: '材质贴图', searchOnly: true },
          { path: '/babylon-flame', label: '粒子火焰' },
          { path: '/babylon-pbr', label: 'PBR 材质' },
        ],
      },
    ],
  },
  {
    key: 'engineering',
    label: '工程能力',
    caption: '网络与浏览器 API、表单文件、第三方插件与数据平台',
    icon: 'engineering',
    tone: '#38bdf8',
    sections: [
      {
        label: '网络与浏览器 API',
        items: [
          { path: '/network-axios', label: 'Axios 请求封装' },
          { path: '/network-websocket', label: 'WebSocket 通信' },
          { path: '/network-sse', label: 'SSE 流式数据' },
          { path: '/network-webrtc', label: 'WebRTC 通信' },
          { path: '/demo', label: 'Chrome TTS 语音播报' },
        ],
      },
      {
        label: '表单与文件',
        items: [
          { path: '/form-rich-editor', label: '富文本编辑器' },
          { path: '/form-image-crop', label: '图片裁剪上传' },
          { path: '/form-signature', label: '手写签名' },
          { path: '/form-excel-data-entry-vxe', label: 'Excel 数据录入' },
          { path: '/form-export-to-excel', label: 'Excel 导出' },
          { path: '/plugin-word-pdf-preview', label: '文件预览下载' },
          { path: '/plugins-jspreadsheet-ce', label: 'jspreadsheet 表格' },
        ],
      },
      {
        label: '插件与数据平台',
        items: [
          { path: '/vue3SlideVerify', label: '滑动验证' },
          { path: '/plugins-vueuse', label: 'VueUse 组合式函数' },
          { path: '/plugins-draggable-formula', label: '拖拽公式' },
          { path: '/pluginsLittle', label: '小插件合集' },
          { path: '/data-platform-metric-catalog', label: '指标口径管理' },
        ],
      },
    ],
  },
  {
    key: 'framework',
    label: 'Vue 深入',
    caption: 'Vue 3 核心特性、状态管理、性能优化与工具函数',
    icon: 'framework',
    tone: '#34d399',
    sections: [
      {
        label: '核心特性与状态',
        items: [
          { path: '/vue3-core-lab', label: 'Vue3 核心特性合集', badge: '4' },
          { path: '/vue3-teleport', label: 'Teleport 传送门', searchOnly: true },
          { path: '/vue3-suspense', label: 'Suspense 异步组件', searchOnly: true },
          { path: '/vue3-provide-inject', label: 'provide / inject', searchOnly: true },
          { path: '/vue3-watch-compare', label: 'watch 对比', searchOnly: true },
          { path: '/store-perf-lab', label: '状态与性能合集', badge: '4' },
          { path: '/store-persist', label: 'Pinia 持久化', searchOnly: true },
          { path: '/store-setup', label: 'Setup Store', searchOnly: true },
          { path: '/perf-keep-alive', label: 'KeepAlive 缓存', searchOnly: true },
          { path: '/perf-async-component', label: '异步组件懒加载', searchOnly: true },
        ],
      },
      {
        label: '工具函数',
        items: [
          { path: '/utils-lab', label: '工具函数合集', badge: '5' },
          { path: '/utils-copy-clone', label: '深拷贝与浅拷贝', searchOnly: true },
          { path: '/utils-debounce-throttle', label: '防抖节流原理', searchOnly: true },
          { path: '/utils-event-bus', label: '事件总线 mitt', searchOnly: true },
          { path: '/utils-clipboard', label: '剪贴板操作', searchOnly: true },
          { path: '/utils-indexeddb', label: 'IndexedDB 封装', searchOnly: true },
        ],
      },
    ],
  },
  {
    key: 'style',
    label: '样式与动效',
    caption: 'CSS 布局技法、层叠细节与关键帧动画',
    icon: 'style',
    tone: '#f472b6',
    sections: [
      {
        label: 'CSS 布局',
        items: [
          { path: '/css-layout-lab', label: 'CSS 布局合集', badge: '4' },
          { path: '/css-grid', label: 'Grid 布局', searchOnly: true },
          { path: '/css-flex', label: 'Flex 布局', searchOnly: true },
          { path: '/css-responsive', label: '响应式布局', searchOnly: true },
          { path: '/css-semantization', label: '语义化标签', searchOnly: true },
        ],
      },
      {
        label: 'CSS 效果与动效',
        items: [
          { path: '/css-effects-lab', label: 'CSS 效果合集', badge: '6' },
          { path: '/css-keyframe-animation', label: '关键帧动画', searchOnly: true },
          { path: '/css-backdrop', label: '毛玻璃', searchOnly: true },
          { path: '/css-var-theme', label: '变量主题', searchOnly: true },
          { path: '/css-zindex', label: 'z-index 层叠', searchOnly: true },
          { path: '/css-pseudo-element', label: '伪元素伪类', searchOnly: true },
          { path: '/css-whitespace-wordbreak-wordwrap', label: '换行处理', searchOnly: true },
          { path: '/animations', label: '动画大全' },
        ],
      },
    ],
  },
  {
    key: 'extended',
    label: '补缺新增',
    caption: '2026-10 缺口盘点后新增：流程协作、AI、媒体与工程效率',
    icon: 'spark',
    tone: '#fbbf24',
    sections: [
      {
        label: '流程与协作',
        items: [
          { path: '/workflow-designer', label: '审批流设计器' },
          { path: '/gantt-schedule', label: '甘特图排期' },
          { path: '/permission', label: '权限方案' },
        ],
      },
      {
        label: 'AI 与多媒体',
        items: [
          { path: '/ai-chat', label: 'AI 对话界面' },
          { path: '/speech-recognition', label: '语音识别与录音' },
          { path: '/screenshot-capture', label: '页面截图' },
          { path: '/pdf-export', label: 'PDF 生成' },
        ],
      },
      {
        label: '工程效率',
        items: [
          { path: '/code-editor', label: '代码编辑器' },
          { path: '/api-mock', label: '接口 Mock' },
          { path: '/unit-test', label: '单元测试示例' },
          { path: '/gsap-animation', label: 'GSAP 动画' },
          { path: '/mind-map', label: '思维导图' },
          { path: '/i18n-demo', label: '国际化' },
          { path: '/teacher-manage', label: '教师信息 CRUD' },
        ],
      },
    ],
  },
];

/** 扁平化索引：搜索与命令面板共用（含 searchOnly 条目，保证合集页内示例仍可直达） */
export const allNavItems: FlatNavItem[] = navGroups.reduce<FlatNavItem[]>((acc, group) => {
  group.sections.forEach((section) => {
    section.items.forEach((item) => {
      acc.push({
        ...item,
        groupKey: group.key,
        groupLabel: group.label,
        sectionLabel: section.label,
      });
    });
  });
  return acc;
}, []);

/** 示例总数（用于侧边栏、品牌徽标与首页统计，含合集页内的子示例） */
export const navTotal = allNavItems.length;

/** 菜单可见条目数（不含 searchOnly） */
export const visibleCountOfSection = (section: NavSection): number =>
  section.items.filter((item) => !item.searchOnly).length;

export const countOfGroup = (group: NavGroup): number =>
  group.sections.reduce((sum, section) => sum + visibleCountOfSection(section), 0);

export const firstPathOfGroup = (group: NavGroup): string =>
  group.sections[0]?.items.find((item) => !item.searchOnly)?.path ?? '/home';

/** 关键字检索：命中标题、路径、分区与分组名 */
export const searchNav = (keyword: string): FlatNavItem[] => semanticSearch(keyword, allNavItems);

/** 兼容旧引用：侧边栏仍是「一组菜单」的入参形态 */
export const menuList = navGroups;
