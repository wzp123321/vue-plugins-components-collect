/**
 * mapConfig.ts —— 3D 中国地图视觉参数集中配置
 *
 * 本文件职责：
 *   把地图的几何与配色参数（拉伸厚度、各种线宽、数据柱尺寸、飞线参数、
 *   bloom 图层号等）集中成一份常量，供所有绘制模块读取，避免散落硬编码。
 *
 * 在整体架构中的角色：全局视觉约定源。配合 projection.MAP_EXTENT，决定
 *   三级地图（全国 / 省 / 市）共用的那套「相机距离、厚度、柱体尺寸、飞线弧度」。
 *
 * 协作模块：几乎所有 utils / components 模块都 import 本文件。
 *
 * 架构约定：
 *   ⚠️ 线框必须贴顶面（lineZ = depth + 0.06）：原来悬浮 1.5，斜视角下北侧
 *   边境线会明显离开板块边缘。这里用极小 epsilon 让线框紧贴顶面，斜看不飘离。
 *   ⚠️ bloom 只作用于 bloomLayer 图层（数据柱 / 飞线头部），不要用
 *   GammaCorrectionShader 全局提亮——它会把暗色按 pow(1/2.2) 提亮，让深色
 *   地图整体发灰蓝。
 */

/** 板块拉伸厚度（世界单位），同时作为线框 / 锚点的高度基准 */
const DEPTH = 6

export const mapConfig = {
  /** 板块拉伸厚度 */
  depth: DEPTH,
  /** 顶面不透明度 */
  opacity: 0.94,
  /** 板块顶面基色 */
  color: '#0A1730',
  /** 悬停高亮色 */
  hoverColor: '#2C6B8C',
  /** 选中（点击锁定）高亮色 */
  focusColor: '#2A6E92',
  /** 侧壁竖直渐变（上 → 下） */
  sideColorTop: '#0A1E42',
  sideColorBottom: '#040E24',

  /** 层级内部界线（省界 / 市界） */
  innerLineColor: 0x2a6c90,
  innerLineWidth: 1.3,
  /** 当前层级外轮廓 */
  outlineColor: 0x54b4e4,
  outlineWidth: 2.2,
  outlineGlowScale: 2.6,

  /** 贴面线层级：紧贴顶面（depth + 极小 epsilon） */
  // ⚠️ 坑：线框必须贴顶面。原来悬浮 1.5，斜视角下北侧边境线会明显离开板块边缘；
  // 用 depth + 0.06 让线框紧贴顶面，斜看不飘离。
  lineZ: DEPTH + 0.06,
  /** 数据柱 / 标牌锚点层级（略高于顶面，避免 z-fighting） */
  spotZ: DEPTH + 0.35,

  /** 数据柱尺寸 */
  columnHeight: 13,
  columnRadius: 0.22,

  /** 飞线（流星） */
  fly: {
    /** 弧线抬升：基础高度 + 按距离增长（封顶） */
    arcBase: 3,
    arcMax: 24,
    arcRatio: 0.42,
    /** 轨道两端 / 中段颜色 */
    trackColorNear: '#081D2E',
    trackColorFar: '#15496F',
    /** 轨道 / 拖尾宽度（世界单位，随距离自然近粗远细） */
    trackWidth: 0.34,
    streakWidth: 0.66,
    /** 拖尾长度（占弧长比例） */
    streakBand: 0.34,
    /** 拖尾亮度：彩色尾焰峰值 / 白热核峰值 */
    tailGain: 0.4,
    coreGain: 0.42,
    /** 头部光点直径与不透明度 */
    headSize: 1.5,
    headOpacity: 0.32,
    /** 默认每秒前进的弧长比例 */
    speed: 0.2,
  },

  /** 选择性泛光：只有该图层参与 bloom */
  bloomLayer: 1,
} as const
