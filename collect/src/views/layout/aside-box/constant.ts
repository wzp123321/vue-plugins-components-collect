/*
 * 导航结构（重新规划版）
 *
 * 旧结构：14 个顶级菜单，每个菜单直接挂一串路由（最长 19 项平铺），
 *        侧边栏需要滚动很久，且同级之间没有语义归类。
 * 新结构：6 个能力域 → 若干分区 → 具体示例，三级收敛。
 *        顶级菜单由 14 个降到 6 个，单个分区最多 14 项。
 *
 * 注意：这里只组织「导航」，不新增/删除路由。
 *      每个 path 都对应 src/router/modules/*.ts 中已存在的路由。
 */

import { semanticSearch } from '@/utils/semantic-search';

export interface NavItem {
  path: string;
  label: string;
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
    sections: [
      {
        label: '通用组件',
        items: [
          { path: '/component-home', label: '组件总览' },
          { path: '/component-inputFilter', label: '输入框过滤' },
          { path: '/spark-upload', label: '大文件上传' },
          { path: '/component-qr-code', label: '二维码生成' },
          { path: '/tree-select-transfer', label: '树形穿梭' },
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
      {
        label: '自定义指令',
        items: [
          { path: '/inputFilter', label: '输入框过滤指令' },
          { path: '/drag', label: '拖拽指令' },
        ],
      },
    ],
  },
  {
    key: 'visual',
    label: '可视化 & 3D',
    caption: 'ECharts、G6 与 Three.js / Babylon.js 的三维表达',
    icon: 'visual',
    sections: [
      {
        label: '图表',
        items: [
          { path: '/echarts', label: 'ECharts 集合' },
          { path: '/echarts-map', label: '大屏地球' },
          { path: '/echarts-province', label: '省份地图' },
          { path: '/data-vis-g6', label: 'G6 拓扑图' },
        ],
      },
      {
        label: 'Three.js',
        items: [
          { path: '/threejs-basic', label: '基础图形' },
          { path: '/threejs-scene', label: '场景与物体' },
          { path: '/threejs-sun', label: '太阳地球' },
          { path: '/threejs-galaxy', label: '粒子银河系' },
          { path: '/threejs-raycaster', label: '交互拾取' },
          { path: '/threejs-china-3d-map', label: '中国 3D 地图' },
        ],
      },
      {
        label: 'Babylon.js',
        items: [
          { path: '/babylon-base', label: '基础场景' },
          { path: '/babylon-mesh', label: '几何形状' },
          { path: '/babylon-params', label: '参数化建模' },
          { path: '/babylon-texture', label: '材质贴图' },
          { path: '/babylon-flame', label: '粒子火焰' },
          { path: '/babylon-pbr', label: 'PBR 材质' },
        ],
      },
    ],
  },
  {
    key: 'engineering',
    label: '工程能力',
    caption: '网络通信、表单文件与第三方插件接入',
    icon: 'engineering',
    sections: [
      {
        label: '网络通信',
        items: [
          { path: '/network-axios', label: 'Axios 请求封装' },
          { path: '/network-websocket', label: 'WebSocket 通信' },
          { path: '/network-sse', label: 'SSE 流式数据' },
          { path: '/network-webrtc', label: 'WebRTC 通信' },
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
        label: '数据平台',
        items: [{ path: '/data-platform-metric-catalog', label: '指标口径管理' }],
      },
      {
        label: '插件生态',
        items: [
          { path: '/vue3SlideVerify', label: '滑动验证' },
          { path: '/plugins-vueuse', label: 'VueUse 组合式函数' },
          { path: '/plugins-draggable-formula', label: '拖拽公式' },
          { path: '/pluginsLittle', label: '小插件合集' },
        ],
      },
    ],
  },
  {
    key: 'framework',
    label: 'Vue 深入',
    caption: 'Vue 3 核心特性、状态管理、性能优化与工具函数',
    icon: 'framework',
    sections: [
      {
        label: '核心特性',
        items: [
          { path: '/vue3-advanced', label: 'Vue3 进阶特性' },
          { path: '/vue3-teleport', label: 'Teleport 传送门' },
          { path: '/vue3-suspense', label: 'Suspense 异步组件' },
          { path: '/vue3-provide-inject', label: 'provide / inject' },
          { path: '/vue3-watch-compare', label: 'watch 对比' },
        ],
      },
      {
        label: '状态管理',
        items: [
          { path: '/store-persist', label: 'Pinia 持久化' },
          { path: '/store-setup', label: 'Setup Store' },
        ],
      },
      {
        label: '性能优化',
        items: [
          { path: '/perf-keep-alive', label: 'KeepAlive 缓存' },
          { path: '/perf-async-component', label: '异步组件懒加载' },
        ],
      },
      {
        label: '工具函数',
        items: [
          { path: '/utils-advance', label: '工具函数进阶' },
          { path: '/utils-copy-clone', label: '深拷贝与浅拷贝' },
          { path: '/utils-debounce-throttle', label: '防抖节流原理' },
          { path: '/utils-event-bus', label: '事件总线 mitt' },
          { path: '/utils-clipboard', label: '剪贴板操作' },
          { path: '/utils-indexeddb', label: 'IndexedDB 封装' },
        ],
      },
    ],
  },
  {
    key: 'style',
    label: '样式与动效',
    caption: 'CSS 布局技法、层叠细节与关键帧动画',
    icon: 'style',
    sections: [
      {
        label: 'CSS 布局',
        items: [
          { path: '/css-home', label: 'CSS 总览' },
          { path: '/css-grid', label: 'Grid 布局' },
          { path: '/css-flex', label: 'Flex 布局' },
          { path: '/css-responsive', label: '响应式布局' },
          { path: '/css-semantization', label: '语义化标签' },
        ],
      },
      {
        label: 'CSS 技法',
        items: [
          { path: '/css-whitespace-wordbreak-wordwrap', label: '换行处理' },
          { path: '/css-zindex', label: 'z-index 层叠' },
          { path: '/css-pseudo-element', label: '伪元素伪类' },
          { path: '/css-backdrop', label: '毛玻璃' },
          { path: '/css-keyframe-animation', label: '关键帧动画' },
          { path: '/css-var-theme', label: '变量主题' },
        ],
      },
      {
        label: '动效',
        items: [{ path: '/animations', label: '动画大全' }],
      },
    ],
  },
  {
    key: 'lab',
    label: '实验室',
    caption: '浏览器原生能力试验田',
    icon: 'lab',
    sections: [
      {
        label: '浏览器能力',
        items: [{ path: '/demo', label: 'Chrome TTS 语音播报' }],
      },
    ],
  },
];

/** 扁平化索引：搜索与命令面板共用 */
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

/** 示例总数（用于侧边栏、品牌徽标与首页统计） */
export const navTotal = allNavItems.length;

export function countOfGroup(group: NavGroup): number {
  return group.sections.reduce((sum, section) => sum + section.items.length, 0);
}

export function firstPathOfGroup(group: NavGroup): string {
  return group.sections[0]?.items[0]?.path ?? '/home';
}

/** 关键字检索：命中标题、路径、分区与分组名 */
export function searchNav(keyword: string): FlatNavItem[] {
  return semanticSearch(keyword, allNavItems);
}

/** 兼容旧引用：侧边栏仍是「一组菜单」的入参形态 */
export const menuList = navGroups;
