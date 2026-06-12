import type { Component } from 'vue';

export type ListItem = {
  title?: string;
  main: string;
  description?: string;
  prefixicon?: string | Component;
  avatar?: string;
  tag?: string;
  extra?: string;
  checked?: boolean;
  key?: string | number;
  status?: 'default' | 'pressed' | 'disabled';
  disabled?: boolean;
};

/**
 * List 列表组件 Props 定义
 * @description 简化版列表组件
 */

export interface ListProps {
  /** 列表类型 */
  type?: 'default' | 'switch' | 'person';
  /** 列表数据 */
  list: ListItem[];
  /** 列表标题 */
  groupTitle?: string;
}

export const defaultProps = {
  groupTitle: '',
  type: 'default',
  list: () => [],
} as const;
