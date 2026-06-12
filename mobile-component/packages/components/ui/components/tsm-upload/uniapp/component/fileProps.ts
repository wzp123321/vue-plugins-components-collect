/**
 * Upload 上传组件 Props 定义
 * @description 简化版上传组件
 */
import type { CSSProperties } from 'vue';

export interface UploadProps {
  /** 已上传的文件列表 */
  fileList: any[];
  /** 上传请求函数， */
  httpRequest?: (file: any) => Promise<{ name: string; url: string; size?: number }>;
  /**允许上传的文件类型 */
  accept?: string[];
  /** 文件最大上传数量 */
  maxCountFile?: number;
  /** 文件单个文件最大大小（单位：MB） */
  maxSizeFile?: number;
  /**上传前的钩子函数 */
  beforeUpload?: (file: any) => Promise<boolean> | boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  maxCountFile: 4,
  maxSizeFile: 500,
  disabled: false,
  readonly: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
