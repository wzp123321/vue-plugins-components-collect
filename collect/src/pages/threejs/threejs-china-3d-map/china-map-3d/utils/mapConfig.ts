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
  /** 板块顶面基色（比侧壁亮一档，让板块顶面从侧壁里浮出来） */
  color: '#0F2A4A',
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
  /** 当前层级外轮廓：宽度收细、光晕收窄，避免一圈白色泛光抢掉板块本身的注意力 */
  outlineColor: 0x54b4e4,
  outlineWidth: 1.4,
  outlineGlowScale: 1.6,

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
    /** 轨道两端 / 中段颜色（提亮一档：原 #081D2E/#15496F 在深色地图上近乎隐形） */
    trackColorNear: '#0F3049',
    trackColorFar: '#20618F',
    /** 轨道 / 拖尾宽度（世界单位，随距离自然近粗远细） */
    trackWidth: 0.34,
    streakWidth: 0.66,
    /** 拖尾长度（占弧长比例） */
    streakBand: 0.34,
    /** 拖尾亮度：彩色尾焰峰值 / 白热核峰值 */
    tailGain: 0.46,
    coreGain: 0.5,
    /** 头部光点直径与不透明度 */
    headSize: 1.5,
    headOpacity: 0.45,
  /** 默认每秒前进的弧长比例 */
  speed: 0.2,
  /**
   * 每圈结尾的停顿比例：0.55 = 停顿时长约为飞行时长的 55%。
   * 流星到终点熄灭后歇一拍再发射下一颗，循环是「飞行→落地→停顿」而非
   * 无缝连发；调 0 即回到旧的连续循环。
   */
  restGap: 0.55,
  /** 端点涟漪：飞线起点/落点的扩散圆环（装饰层，随飞线显隐） */
  ripple: {
    /** 单个涟漪的最大世界直径 */
    size: 5,
    /** 枢纽端点相对普通端点的放大倍数（枢纽是辐射源，涟漪更大） */
    hubScale: 1.6,
    /** 每秒扩散多少圈（1 = 一秒一轮） */
    speed: 0.42,
    /** 涟漪峰值不透明度（扩散过程中按 (1-prog)^1.6 衰减） */
    opacity: 0.5,
  },
  },

  /** 展示型大屏装饰层参数（棱锥 / 轨道 / 热力），集中配置便于调参 */
  decor: {
    /** 动态棱锥点位 */
    pyramid: { height: 9, radius: 1.1 },
    /** 轨道路线：多条由近到远倾斜环 + 卫星 */
    orbit: {
      count: 3,
      radiusNear: 150,
      radiusFar: 210,
      tilt: 0.35,
      lift: 22,
      tube: 0.32,
      satSize: 2.4,
      speed: 0.06,
      color: '#7FD4F5',
    },
    /** 高度热力面 */
    heat: { grid: 96, opacity: 0.55, zOffset: 0.12 },
    /** 侧壁扫描流光：自下而上扫掠的发光带（强度由 intensity 控制，0=关闭） */
    scan: { color: '#7FE9FF', width: 0.055, speed: 0.14, intensity: 1.0 },
    /** 底部辉光地面：地图正下方的放射状光晕 */
    ground: { color: '#0B3B5E', radius: 1.7, opacity: 0.9 },
  },

  /** 选择性泛光：只有该图层参与 bloom */
  bloomLayer: 1,
} as const

/**
 * 主题（暗 / 亮）调色板：仅在切换主题时整体覆写到 mapConfig 对应字段。
 * 板块上色（useMapLayer.paint）与几何创建（drawRegion / drawOutline）都实时读取
 * mapConfig，故换主题 = 覆写配色 + 重新 paint 现有层；新层级重建时自动沿用新主题。
 */
export type ThemeName = 'dark' | 'light'

export interface ThemePalette {
  color: string
  hoverColor: string
  focusColor: string
  opacity: number
  sideColorTop: string
  sideColorBottom: string
  innerLineColor: number
  outlineColor: number
}

export const themePalettes: Record<ThemeName, ThemePalette> = {
  dark: {
    color: '#0A1730',
    hoverColor: '#2C6B8C',
    focusColor: '#2A6E92',
    opacity: 0.94,
    sideColorTop: '#0A1E42',
    sideColorBottom: '#040E24',
    innerLineColor: 0x2a6c90,
    outlineColor: 0x54b4e4,
  },
  light: {
    color: '#C9DCEC',
    hoverColor: '#5BA8D0',
    focusColor: '#3E92C0',
    opacity: 0.96,
    sideColorTop: '#AEC6DA',
    sideColorBottom: '#8FB0CC',
    innerLineColor: 0x6fa8c8,
    outlineColor: 0x2a6c90,
  },
}

let activeThemeName: ThemeName = 'dark'
export const getThemeName = (): ThemeName => activeThemeName

/** 应用主题：把调色板覆写到 mapConfig（运行时可写），并记忆当前主题名 */
export const applyTheme = (name: ThemeName): void => {
  const p = themePalettes[name]
  if (!p) return
  activeThemeName = name
  const anyMap = mapConfig as Record<string, unknown>
  anyMap.color = p.color
  anyMap.hoverColor = p.hoverColor
  anyMap.focusColor = p.focusColor
  anyMap.opacity = p.opacity
  anyMap.sideColorTop = p.sideColorTop
  anyMap.sideColorBottom = p.sideColorBottom
  anyMap.innerLineColor = p.innerLineColor
  anyMap.outlineColor = p.outlineColor
}
