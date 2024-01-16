import type { Common_EClickStatus } from '@/config/enum';

/**
 * 对象
 */
export interface Common_IObject {
  [key: string]: string | number | boolean | Common_IObject;
}

/**
 * http列表请求
 */
export interface Common_IHttpListResponseImpl<T> {
  list: T;
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}

/**
 * http请求
 */
export interface Common_IHttpResponseImpl<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * CodeName对象
 */
export interface Common_ICodeName<T = string> {
  code: T;
  name: string;
}

/**
 * KeyValue对象
 */
export interface Common_IKeyValue<T = string> {
  key: T;
  value: string;
}

/**
 * ValueLabel对象
 */
export interface Common_IValueLabel<T = string> {
  value: T;
  label: string;
}

/**
 * 系统信息
 */
export interface Common_ISystemVO {
  // 可使用窗口宽度
  windowWidth: number;
  // 可使用窗口高度
  windowHeight: number;
  // 手机屏幕高度
  screenHeight: number;
  // 手机屏幕宽度
  screenWidth: number;
  // 系统
  platform: string;
}

/**
 * 能源类型
 */
export interface Common_IEnergyVO {
  code: string;
  name: string;
  unit: string;
}

/**
 * 树节点
 */
export interface Common_ITreeVO {
  /**
   * 树节点ID
   */
  id: number;
  /**
   * 树节点名字
   */
  treeName: string;
  /**
   * 全节点名
   */
  treeNames?: string;
  /**
   * 是否有子节点
   */
  hasChild: boolean;
  /**
   * 是否能点击选择
   */
  clickStatus?: Common_EClickStatus;
  /**
   * 子节点
   */
  childTree?: Common_ITreeVO[];
}

// 公共事件对象
export interface Common_IEvent<T> {
  currentTarget: Common_IScrollTargetVO;
  target: Common_IScrollTargetVO;
  detail: T;
  timeStamp: number;
  type: string;
}
export interface Common_IScrollTargetVO {
  id: string;
  offsetLeft: number;
  offsetTop: number;
}

/**
 * 滚动事件回调参数
 */
export interface Common_IScrollEventDetail {
  deltaX: number;
  deltaY: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
}
/**
 * 时间选择参数
 */
export interface Common_IDatePickerVO {
  value: string;
}

/**
 * 同环比
 */
export interface Common_ITHCompareVO {
  tbFlag: boolean;
  hbFlag: boolean;
}


/**
 * 缺省提示语
 */
export interface Common_IErrorTitle{
  title:string;
  subTitle:string
}