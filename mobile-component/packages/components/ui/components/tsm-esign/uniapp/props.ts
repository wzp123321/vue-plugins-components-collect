/**
 * Esign 电子签名组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface EsignProps {
  /**
   * 签名图地址（v-model）
   * 支持：图片 URL / 本地临时路径(tempFilePath) / base64(data:image 前缀 或 裸 base64 均可回显)
   * 空字符串表示未签名
   */
  modelValue?: string;
  /** 是否只读（只读后不可点击进入签名；置空不可点场景应改用展示而非本组件） */
  readonly?: boolean;
  /** 签名展示区域高度，支持 rpx/px，默认 300rpx */
  height?: string;
  /** 展示区未签名提示文案（仅可编辑态展示；只读态未签名时固定展示 `-`） */
  placeholder?: string;
  /** 编辑层标题 */
  editorTitle?: string;
  /** 编辑层画布为空时的提示文案 */
  hintText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 清除按钮文案 */
  clearText?: string;
  /** 确定按钮文案 */
  confirmText?: string;
  /** 笔迹颜色 */
  penColor?: string;
  /** 笔迹宽度(px) */
  lineWidth?: number;
  /** 签名纸(画布/展示区)底色 */
  backgroundColor?: string;
  /** 导出放大倍数（用于提升清晰度），默认 2 */
  exportScale?: number;
  /**
   * 旋转横屏签字板顶部预留高度(px)，默认 0
   * H5 竖屏进横屏签字时，编辑层顶部栏整体下移该距离，用于避开系统状态栏／刘海。
   * 沉浸式隐藏状态栏后，部分机型仍会遗留时间显示；不留白则返回按钮被其盖住且点不到。
   * 组件在 H5 build 下取不到真实状态栏高度（uni 恒报 0），需由页面注入自身算好的安全区值
   * （如 `Math.max(statusBarHeight, env(safe-area-inset-top), 平台兜底值)`）。
   */
  landscapeTopInset?: number;
  /**
   * 编辑层是否 Teleport 到 body，默认 true
   * 页面里若有 transform / overflow 等会形成包含块的祖先，页面内的 fixed 编辑层会被裁剪，
   * 或被页面导航条／状态栏盖住（iOS 上尤其明显）；挂到 body 即脱离该包含块。
   * 仅 H5 生效：小程序 / App 运行时没有 Teleport，编译期整段剔除，退化为页面内渲染。
   */
  teleportToBody?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: '',
  readonly: false,
  height: '300rpx',
  placeholder: '点击签名板签署名字',
  editorTitle: '签名',
  hintText: '请在空白区域签名',
  cancelText: '取消',
  clearText: '清除',
  confirmText: '确定',
  penColor: '#181D27',
  lineWidth: 3,
  backgroundColor: '#F5F6F8',
  exportScale: 2,
  landscapeTopInset: 0,
  teleportToBody: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
