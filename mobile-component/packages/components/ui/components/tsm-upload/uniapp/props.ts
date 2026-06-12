/**
 * Upload 上传组件 Props 定义
 * @description 简化版上传组件
 */
import type { CSSProperties } from 'vue';

export interface UploadProps {
  /** 已上传的文件列表 */
  fileList: { name: string; url: string; size?: number }[];
  /** 上传请求函数,promise的resolve状态判定未上传成功，reject状态判定为上传失败 */
  httpRequest?: (file: any) => Promise<{ name: string; url: string; size?: number }>;
  /**上传类型，可选值：file：文件上传，以列表形式展示，media：图片，视频上传，以card形式展示 */
  type?: 'file' | 'media';
  /**type=media类型时，图片和视频是否都需要。可选值：image：可以上传图片文件，video：可以上传视频文件 */
  mediaTypes?: ('image' | 'video')[];
  /**image从相册选和拍照 */
  imageSourceType?: ('album' | 'camera')[];
  /** video从相册选和拍照 */
  videoSourceType?: ('album' | 'camera')[];
  /** 图片最大上传数量 */
  maxCountImage?: number;
  /** 视频最大上传数量 */
  maxCountVideo?: number;
  /** 图片单个文件最大大小（单位：kb） */
  maxSizeImage?: number;
  /** 视频单个文件最大大小（单位：MB） */
  maxSizeVideo?: number;
  /** 允许上传的文件类型，type=file时生效,默认不限制 */
  accept?: string[];
  /** 文件最大上传数量 */
  maxCountFile?: number;
  /** 单个文件最大大小（单位：MB） */
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
  type: 'media',
  mediaTypes: (): ('image' | 'video')[] => ['image'],
  imageSourceType: (): ('album' | 'camera')[] => ['album', 'camera'],
  videoSourceType: (): ('album' | 'camera')[] => ['album', 'camera'],
  maxCountImage: 5,
  maxCountVideo: 1,
  maxSizeImage: 500,
  maxSizeVideo: 500,
  maxCountFile: 4,
  maxSizeFile: 500,
  disabled: false,
  readonly: false,
  /** 自定义类名 */
  customClass: '',
  customStyle: () => ({}),
} as const;
