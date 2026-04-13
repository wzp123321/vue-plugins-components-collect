import { AllowedComponentProps, VNodeProps } from './_common';

declare interface ImageViewerProps {
  /**
   * 图片地址，Array<String>|Array<Object>形式
   * @default []
   */
  urls?: string[] | object[];
  /**
   * 指定从数组的对象元素中读取哪个属性作为图片地址
   * @default ""
   */
  keyName?: string;
  /**
   * 单图时，图片长边的长度
   * @default 180
   */
  singleSize?: string | number;
  /**
   * 多图时，图片边长
   * @default 70
   */
  multipleSize?: string | number;
  /**
   * 多图时，图片水平和垂直之间的间隔
   * @default 6
   */
  space?: string | number;
  /**
   * 单图时，图片缩放裁剪的模式
   * @default "scaleToFill"
   */
  singleMode?: string;
  /**
   * 多图时，图片缩放裁剪的模式
   * @default "aspectFill"
   */
  multipleMode?: string;
  /**
   * 最多展示的图片数量，超出时最后一个位置将会显示剩余图片数量
   * @default 9
   */
  maxCount?: string | number;
  /**
   * 是否可以预览图片
   * @default true
   */
  previewFullImage?: boolean;
  /**
   * 每行展示图片数量，如设置，singleSize和multipleSize将会无效
   * @default 3
   */
  rowCount?: string | number;
  /**
   * 超出maxCount时是否显示查看更多的提示
   * @default true
   */
  showMore?: boolean;
  /**
   * 图片形状，circle-圆形，square-方形
   * @default ""
   */
  shape?: 'circle' | 'square' | '';
  /**
   * 圆角，单位任意
   * @default ""
   */
  radius?: string | number;
  /**
   * 自适应换行
   * @default false
   */
  autoWrap?: boolean;
  /**
   * 单位
   * @default "px"
   */
  unit?: string;
}

declare interface _ImageViewer {
  new (): {
    $props: AllowedComponentProps & VNodeProps & ImageViewerProps;
  };
}

export declare const ImageViewer: _ImageViewer;
