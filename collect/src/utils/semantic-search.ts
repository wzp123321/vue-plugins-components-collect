import type { FlatNavItem } from '@/views/layout/aside-box/constant';

/**
 * 命令面板语义检索（Phase 0：本地、零后端、零 API key）
 *
 * 设计目标：把 Ctrl+K 的「纯 substring 匹配」升级为「同义词扩展 + 加权打分」的意图检索。
 * 例如用户输入「可拖拽排序的看板」，即使没有 demo 标题叫这个名字，也能命中 te-drag-design。
 *
 * 设计约束：
 * - 不修改 navGroups 里那 80 条目录定义（避免大改），所有「语义知识」集中在本文件。
 * - 纯函数：由 constant.ts 把 allNavItems 传进来，避免循环依赖。
 */

/** 同义词分组：命中组内任意一个词，就扩展出整组，用于意图扩召回 */
const SYNONYM_GROUPS: string[][] = [
  ['拖拽', 'drag', 'draggable', '排序', 'sort', '看板', 'kanban', '拖动'],
  ['导出', 'export', 'excel', '报表', '表格导出'],
  ['导入', 'import', '录入', '填写'],
  ['地图', 'map', '三维', '3d', '地理', '省份', '下钻', '飞线', '立体'],
  ['图表', 'chart', 'echarts', '可视化', 'visualization', '大屏', '数据屏'],
  ['动画', 'animation', '动效', 'animate', '过渡', 'transition'],
  ['表单', 'form', '校验', 'validate', '输入'],
  ['表格', 'table', 'grid', '虚拟列表', 'virtual', '在线表格'],
  ['二维码', 'qrcode', 'qr', '条码'],
  ['打印', 'print', '标签', '条码打印'],
  ['树', 'tree', '层级', 'tree-select', '区域树'],
  ['富文本', 'editor', '富文本编辑', 'wysiwyg', 'markdown'],
  ['权限', 'permission', 'auth', '角色', '登录'],
  ['缓存', 'cache', 'keepalive', 'keep-alive', '保活', '持久化'],
  ['异步', 'async', '懒加载', 'lazy', '动态导入', '代码分割'],
  ['复制', 'copy', '剪贴板', 'clipboard'],
  ['截图', 'screenshot', 'html2canvas', '快照'],
  ['水印', 'watermark'],
  ['时间', '日期', 'date', 'datetime', '日历', 'calendar'],
  ['上传', 'upload', '文件', '分片', '断点续传'],
  ['视频', 'video', '播放', '音视频'],
  ['音频', 'audio', '语音', 'tts', '朗读', '合成'],
  ['加密', 'crypto', 'aes', '加解密', '安全'],
  ['节流', '防抖', 'debounce', 'throttle'],
  ['深拷贝', '拷贝', 'clone', 'deep'],
  ['主题', 'theme', '暗黑', 'dark', '换肤', 'css变量'],
  ['指令', 'directive', 'v-'],
  ['组件', 'component'],
  ['hook', '组合式', 'composable', 'vueuse'],
  ['状态管理', 'store', 'pinia', '状态'],
  ['事件', 'event', '事件总线', '发布订阅', 'eventbus'],
  ['离线', 'indexeddb', '本地数据库', '本地存储'],
  ['传送', 'teleport', 'portal', '弹层'],
  ['等待', 'suspense', '加载态', '异步组件等待'],
  ['注入', 'provide', 'inject', '依赖注入', '跨层传值'],
  ['侦听', 'watch', '侦听器'],
  ['验证', 'verify', '滑块验证', '滑动验证', '人机验证'],
  ['图片', 'image', '裁剪', 'crop', '裁切'],
  ['签名', 'signature', '手写', '电子签名'],
  ['文档', 'word', 'pdf', '预览', 'office'],
  ['公式', 'formula', 'math'],
  ['关系图', '拓扑', '图可视化', 'antv', '流程图', 'g6'],
  ['地球', '星系', '星空', '粒子', '银河', '太阳系', '太阳', '行星'],
  ['材质', 'pbr', '纹理', '火焰', '网格', '拾取', '射线', '点击选中'],
  ['流式', 'server-sent', 'sse', '推送', 'ai流式', '流式输出'],
  ['双向通信', 'websocket', '聊天', '实时'],
  ['音视频通话', 'webrtc', '实时通信', 'p2p'],
  ['请求库', 'axios', 'http', '拦截器'],
  ['小工具', '实用组件', '工具集'],
];

/**
 * 针对单个 demo 的意图别名（label 是英文/缩写、自然语言搜不到时集中补召回）。
 * key 为 navGroups 中的 path，value 为该 demo 能回答的「自然语言意图」。
 */
const INTENT_ALIASES: Record<string, string[]> = {
  '/threejs-china-3d-map': ['3d地图', '中国地图', '地理', '省份', '飞线', '下钻', '立体板块', '散点'],
  '/threejs-galaxy': ['星系', '星空', '粒子', '银河', '宇宙'],
  '/threejs-sun': ['太阳系', '太阳', '行星', '轨道'],
  '/threejs-raycaster': ['拾取', '点击选中', '射线', '鼠标交互'],
  '/threejs-basic': ['基础场景', '立方体', '入门'],
  '/threejs-scene': ['场景', '相机', '渲染器', '基础'],
  '/babylon-base': ['babylon', '3d引擎', '游戏引擎', '基础'],
  '/babylon-flame': ['火焰', '粒子特效'],
  '/babylon-mesh': ['网格', '几何体', '模型'],
  '/babylon-params': ['参数', '材质参数'],
  '/babylon-pbr': ['pbr', '材质', '物理渲染'],
  '/babylon-texture': ['纹理', '贴图'],
  '/data-vis-g6': ['关系图', '拓扑', '图可视化', 'antv', '流程图'],
  '/echarts-map': ['中国地图', '地图大屏', '大地图', 'echarts地图'],
  '/echarts-province': ['省份地图', '中国省份', '城市地图', '发电量', '城市排行'],
  '/echarts': ['图表', '折线', '柱状', '饼图'],
  '/vchart': ['vchart', 'visactor', '字节图表', '叙事可视化', '声明式图表', '图表对比'],
  '/form-excel-data-entry-vxe': ['表格录入', 'excel录入', 'vxe', '在线表格', '可编辑表格'],
  '/form-export-to-excel': ['导出excel', '导出表格', 'exceljs', '导出报表', '导出数据'],
  '/form-image-crop': ['图片裁剪', '裁切', 'crop', '头像裁剪'],
  '/form-rich-editor': ['富文本', '编辑器', 'wysiwyg'],
  '/form-signature': ['签名', '手写签名', '电子签名', '签字'],
  '/inputFilter': ['输入框过滤', '输入限制', '格式化输入', '输入过滤'],
  '/component-inputFilter': ['输入框过滤', '输入限制', '格式化输入'],
  '/network-sse': ['流式', 'server-sent', '推送', 'ai流式', '流式输出', '实时推送'],
  '/network-websocket': ['双向通信', 'websocket', '聊天', '实时'],
  '/network-webrtc': ['音视频通话', 'webrtc', '实时通信', 'p2p', '视频通话'],
  '/network-axios': ['请求库', 'http', '拦截器', '网络请求'],
  '/perf-async-component': ['异步组件', '懒加载组件', '代码分割', '按需加载'],
  '/perf-keep-alive': ['缓存', '组件保活', '页面保活', 'keepalive'],
  '/plugin-word-pdf-preview': ['文档预览', 'word预览', 'pdf预览', 'office预览'],
  '/plugins-draggable-formula': ['公式', '可拖拽公式', 'math', '数学公式'],
  '/plugins-jspreadsheet-ce': ['在线excel', '电子表格', '类excel', '表格编辑'],
  '/plugins-vueuse': ['vueuse', '工具集', '组合式工具', 'hooks'],
  '/pluginsLittle': ['小工具', '实用组件', '工具集'],
  '/spark-upload': ['大文件上传', '分片上传', '断点续传', '上传进度'],
  '/store-persist': ['状态持久化', '本地存储', 'pinia持久化', '缓存'],
  '/store-setup': ['pinia', '状态管理', 'store', '全局状态'],
  '/te-drag-design': ['表单设计器', '拖拽表单', 'lowcode', '低代码', '表单搭建'],
  '/te-print-one-code': ['条码打印', '一维码', '标签打印'],
  '/te-print-qr': ['二维码打印', '标签打印'],
  '/te-print-template-view': ['模板打印', '套打', '单据打印'],
  '/te-space-attribute': ['空间属性', '区域属性'],
  '/te-space-select': ['空间选择', '区域选择'],
  '/te-space-zone-tree': ['区域树', '层级选择', '空间层级'],
  '/te-qrcode-view': ['二维码', 'qrcode'],
  '/component-qr-code': ['二维码', 'qrcode', '扫码'],
  '/tree-select-transfer': ['树选择', '穿梭框', 'transfer', '双栏选择'],
  '/utils-clipboard': ['剪贴板', '复制', 'clipboard'],
  '/utils-copy-clone': ['深拷贝', '克隆', 'clone', '对象拷贝'],
  '/utils-debounce-throttle': ['防抖', '节流', 'debounce', 'throttle'],
  '/utils-event-bus': ['事件总线', '发布订阅', 'eventbus'],
  '/utils-indexeddb': ['本地数据库', '离线存储', 'indexeddb'],
  '/vue3-teleport': ['传送', '弹层', 'portal'],
  '/vue3-suspense': ['异步组件等待', '加载态', 'suspense'],
  '/vue3-provide-inject': ['依赖注入', '跨层传值', 'provide', 'inject'],
  '/vue3-watch-compare': ['watch', '侦听', '侦听器'],
  '/vue3SlideVerify': ['滑块验证', '滑动验证', '人机验证', 'verify'],
  '/css-var-theme': ['主题', '换肤', 'css变量', '暗黑', 'dark'],
  '/css-semantization': ['语义化', 'bem', '命名'],
  '/drag': ['拖拽', 'drag', 'draggable', '拖动'],
  '/vue3-advanced': ['组合式', '高级用法', 'composition'],
  '/utils-advance': ['工具函数', '高级工具'],
};

/** 把查询词扩展成一组相关词（同义词 + 分词） */
function expandTerms(query: string): string[] {
  const lower = query.toLowerCase();
  const tokens = lower.split(/[\s,，。、；;]+/).filter((t) => t.length > 0);
  const terms = new Set<string>([lower, ...tokens]);

  for (const group of SYNONYM_GROUPS) {
    const hit = group.some(
      (word) => lower.includes(word) || tokens.some((t) => t === word || word.includes(t)),
    );
    if (hit) group.forEach((w) => terms.add(w));
  }

  return [...terms];
}

/** 本地语义检索：同义词扩展 + 加权打分，按相关度排序返回 */
export function semanticSearch(keyword: string, items: FlatNavItem[]): FlatNavItem[] {
  const query = keyword.trim();
  if (!query) return items;

  const terms = expandTerms(query);

  const scored: { item: FlatNavItem; score: number; index: number }[] = [];

  items.forEach((item, index) => {
    const labelT = item.label.toLowerCase();
    const sectionT = item.sectionLabel.toLowerCase();
    const groupT = item.groupLabel.toLowerCase();
    const pathT = item.path.toLowerCase();
    const aliasT = (INTENT_ALIASES[item.path] ?? []).join(' ').toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (!term) continue;
      if (labelT.includes(term)) score += 3;
      if (aliasT.includes(term)) score += 4;
      if (sectionT.includes(term)) score += 2;
      if (groupT.includes(term)) score += 2;
      if (pathT.includes(term)) score += 1;
    }

    if (score > 0) scored.push({ item, score, index });
  });

  scored.sort((a, b) => (b.score - a.score) || (a.index - b.index));
  return scored.map((s) => s.item);
}
