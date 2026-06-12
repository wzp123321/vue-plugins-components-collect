/**
 * ListCell 列表单元格组件 Props 定义
 * @description 业务列表单元格组件，支持多种布局和交互模式
 */
import type { CSSProperties } from 'vue';

export type dataProps = {
  /** 列表单元格唯一标识 */
  id: string;
  /** 列表单元格标题 */
  title?: string;
  /** 列表单元格副标题 */
  subtitle?: string;
  /** 列表单元格数量 */
  count?: number;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否有子项 */
  hasNextLevel?: boolean;
  /** 扩展字段 */
  [key: string]: any;
}
export interface ListCellProps {
  /** 列表单元格数据 */
  data: dataProps;
  /** 选中项 */
  selected?: Array<dataProps>;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  data: () => ({
    id: '',
    title: '',
    subtitle: '',
    count: 0,
    selectable: false,
    hasNextLevel: false,
  } as dataProps),
  selected: () => [],
  customStyle: () => ({}),
} as const;
