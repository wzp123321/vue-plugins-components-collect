export interface ValidateType {
  mode: string;
  trigger: 'blur' | 'change';
  adapter: boolean;
  [key: string]: any;
}

export type Rule = {
  //规则唯一值
  _fc_id: string;
  //拖拽规则ID
  _fc_drag_tag: string;
  //拖拽模板规则ID
  _fc_template?: string;
  //生成组件名称
  type: string;
  //字段 ID
  field: string;
  //编号
  name?: string;
  //字段名称
  title?: string;
  //提示信息
  info?: string;
  //组件的值
  value?: any;
  //组件的配置
  props: Object;
  //组件样式
  style: string | Object;
  //组件class
  class: string | Array<string>;
  //组件事件
  on?: { [key: string]: Function | Function[] };
  //插槽名
  slot?: string;
  //组件的key
  key?: string;
  //是否必填
  $required: boolean | string;
  //组件的选择项
  options?: Array<any>;
  //选择项对应的组件prop名称
  optionsTo?: string;
  //不使用formItem和wrap包裹
  native?: boolean;
  //是否隐藏组件(无dom)
  hidden?: boolean;
  //是否显示组件(有dom)
  display?: boolean;
  //是否进入阅读模式
  preview?: boolean;
  //自定义阅读模式回显
  readMode?: 'custom';
  //组件验证规则
  validate?: ValidateType[];
  //子组件
  children?: Rule[];
  //联动数据
  control?: Array<any>;
  //FormItem配置
  wrap?: Object;
  //逻辑条件/计算公式
  computed?: {
    [key: string]: string | Object;
  };
  //自定义属性
  effect?: {
    //远程数据
    fetch?: Object;
  };
  visiable?: boolean;
  //其他扩展属性
  [key: string]: any;
};
export interface TdfRenderProps {
  /** 表单的值 */
  modelValue: Record<string, any>;
  /** 渲染数据 */
  data?: Rule[];
  /**是否只读 */
  readonly?: boolean;
  /** 是否隐藏底部操作按钮（提交/重置/清除验证），默认展示 */
  hideFooter?: boolean;
  /**
   * 横屏旋转签字板的顶部预留高度(px)，透传给内部 `tsm-esign` 的 `landscapeTopInset`，默认 0。
   * 用于避开系统状态栏／刘海（沉浸态隐藏状态栏后部分机型仍会遗留时间显示，
   * 不留白会盖住签字板的返回按钮且点不到）。由页面传入自身算好的安全区值。
   */
  esignTopInset?: number;
  /**
   * 透传给内部 `tsm-esign` 的 `teleportToBody`，默认 true。
   * 签名编辑层挂到 body，脱离页面祖先的包含块（transform/overflow），
   * 避免 iOS 上被导航条／状态栏遮挡。仅 H5 生效，其余端退化为页面内渲染。
   */
  esignTeleportToBody?: boolean;
  /**
   * 透传给内部 `tsm-picker`（select 项）的 `teleportToBody`，默认 true（追加到 body）。
   * 选择器弹层挂到 body，脱离页面祖先的包含块（transform/overflow），
   * 避免 iOS 上被导航条／状态栏遮挡。仅 H5 生效，其余端退化为页面内渲染。
   */
  selectTeleportToBody?: boolean;
}

export const defaultProps = {
  modelValue: () => ({}),
  data: () => [],
  readonly: false,
  hideFooter: false,
  esignTopInset: 0,
  esignTeleportToBody: true,
  selectTeleportToBody: true,
} as const;
