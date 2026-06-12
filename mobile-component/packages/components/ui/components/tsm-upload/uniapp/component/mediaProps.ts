/**
 * Upload 上传组件 Props 定义
 * @description 简化版上传组件
 */
export interface UploadProps {
  /** 已上传的文件列表 */
  fileList: { name: string; url: string }[];
  /** 上传请求函数， */
  httpRequest?: (file: any) => Promise<{ name: string; url: string }>;
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
  /**上传前的钩子函数 */
  beforeUpload?: (file: any) => Promise<boolean> | boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
}

export const defaultProps = {
  mediaTypes: (): ('image' | 'video')[] => ['image'],
  imageSourceType: (): ('album' | 'camera')[] => ['album', 'camera'],
  videoSourceType: (): ('album' | 'camera')[] => ['album', 'camera'],
  maxCountImage: 5,
  maxCountVideo: 1,
  maxSizeImage: 500,
  maxSizeVideo: 500,
  disabled: false,
  readonly: false,
} as const;
