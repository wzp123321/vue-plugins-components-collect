/**
 * Empty 空状态组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface EmptyProps {
  /**使用场景,block：区块场景，page：页面场景；block场景下支持支type为noData，noSearch，noAuthority */
  scene?: 'block' | 'page';
  /**空类型：noData:无数据，noInternet:无网络，noSearch:无搜索结果，noAuthority:无权限，loadingError:加载失败，noMessage:无消息，noImage:无图片，successTips:成功提示 */
  type: 'noData' | 'noInternet' | 'noSearch' | 'noAuthority' | 'loadingError' | 'noMessage' | 'noImage' | 'successTips';
  /**是否显示图标,block场景下支持,page场景下固定显示图标 */
  isIcon?: boolean;
  /** 提示文字,page场景下支持 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 按钮文字,空不显示按钮；page场景下支持 */
  buttonText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  scene: 'page',
  type: 'noData',
  isIcon: true,
  title: '',
  description: '',
  buttonText: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
