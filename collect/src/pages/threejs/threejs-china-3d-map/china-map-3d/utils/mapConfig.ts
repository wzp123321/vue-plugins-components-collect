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

/**
 * 小面积强调高光：墨蓝体系里唯一的亮色锚点（冰蓝）。
 * 用于数据柱最高档，飞线取同一色；常驻画面的亮部占比约 1.5%。
 * hover / 选中不做跳色，走同色系提亮一档。
 */
export const ACCENT_HIGHLIGHT = '#8FD4F2'

export const mapConfig = {
  /** 板块拉伸厚度 */
  depth: DEPTH,
  /** 顶面不透明度 */
  opacity: 0.94,
  /** 板块顶面基色：渐变贴图作为亮度系数乘在它上面，故取色阶亮端 */
  color: '#7FA8C8',
  /** 悬停高亮色：同色系提亮一档，不做跳色 */
  hoverColor: '#3E6C8E',
  /** 选中（点击锁定）高亮色：比悬停再暗一档，两级状态可区分 */
  focusColor: '#345B78',
  /** 悬停时其余省份的压暗系数：1 = 不压暗，靠面本身提亮表达高亮 */
  dimGain: 1,
  /** 顶面连续渐变贴图：一张低频明暗场铺满整张地图，无网点、无重复图案 */
  surfaceGradient: {
    size: 512,
    /**
     * 调制系数暗端 / 亮端（与 color 相乘得到最终色）。暗端墨蓝、亮端浅钢蓝，
     * 靠明度而非色相拉开层次：面 P50 约 58、P99 约 121，亮端不炸白。
     * 端点 luma 与 8 级明度分布绑定，单独调亮或调暗其中一端会破坏已对齐的
     * 「暗层约 38%、越亮占比越小」形态。
     */
    dark: '#2A4258',
    light: '#9DC4E0',
    /** 线性基底增益：左下暗 → 右上亮 */
    baseGain: 0.38,
    /**
     * 明度分布指数：2.4 把分布压向暗端。这组值与两处柔光是按参考图 C 的
     * 面内明度层级反解出来的（暗层约 38%、越亮占比越小），勿凭观感单改一项。
     * dark / light 只参与最终颜色映射，不参与 level 计算。
     */
    gamma: 2.4,
    /** 极低频起伏幅度，避免读成规整色卡 */
    ripple: 0.035,
    /** 两处大半径柔光（UV 坐标，v 向上）：位置 / 半径 / 强度 */
    highlights: [
      { x: 0.28, y: 0.72, radius: 0.52, gain: 0.81 },
      { x: 0.68, y: 0.38, radius: 0.30, gain: 0.34 },
    ],
  },
  /**
   * 侧壁竖直渐变（上 → 下）。三级明度阶梯：顶面 > 侧壁 > 背景。
   * 侧壁顶必须比顶面暗部再低一档、侧壁底必须明显高于背景，否则整条侧壁
   * 两头都糊掉，地图会读成一张 2D 平片。
   */
  sideColorTop: '#102536',
  sideColorBottom: '#08131E',
  /** 侧壁上沿细亮线：gain = 0 即关闭，只保留纯竖直渐变 */
  sideEdgeColor: '#8FD4F2',
  sideEdgeWidth: 0.02,
  sideEdgeGain: 0,

  /** 层级内部界线（省界 / 市界）：收暗收细，让面而不是线成为主体 */
  innerLineColor: 0x3A6B8C,
  innerLineWidth: 1.0,
  /** 当前层级外轮廓：浅钢蓝，光晕层 opacity 归零 */
  outlineColor: 0x7FB3D4,
  outlineWidth: 1.2,
  outlineGlowScale: 1.4,
  /** 悬停 / 选中板块的边缘线：与内线同宽，比外轮廓亮一档 */
  hoverEdgeColor: 0xB4D8EE,
  hoverEdgeWidth: 1.2,

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
    /** 轨道两端 / 中段：暗墨蓝，只作隐约路线提示，不与顶面渐变抢明度 */
    trackColorNear: '#0D2130',
    trackColorFar: '#3A6B8C',
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
    color: '#7FA8C8',
    hoverColor: '#3E6C8E',
    focusColor: '#345B78',
    opacity: 0.94,
    sideColorTop: '#102536',
    sideColorBottom: '#08131E',
    innerLineColor: 0x3A6B8C,
    outlineColor: 0x7FB3D4,
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
