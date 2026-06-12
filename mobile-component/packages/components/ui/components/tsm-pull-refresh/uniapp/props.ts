/**
 * pull-refresh 列表组件 Props 定义
 * @description 下拉刷新
 */

export interface PullRefreshProps {
  /** 加载中 */
  loading?: boolean;
}

export const defaultProps = {
  loading: false,
} as const;
