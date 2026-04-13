/**
 * Upload 上传组件 Props 定义
 * @description 简化版上传组件
 */
import type { CSSProperties } from 'vue';

export interface UploadProps {
  /** 已上传的文件列表 */
  fileList?: any[];
  /** 最大上传数量 */
  maxCount?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传地址 */
  action?: string;
  /** 上传请求头 */
  headers?: Record<string, any>;
  /** 上传文件字段名 */
  name?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  fileList: () => [],
  maxCount: 9,
  disabled: false,
  action: '',
  headers: () => ({}),
  name: 'file',
  customClass: '',
  customStyle: () => ({}),
} as const;
