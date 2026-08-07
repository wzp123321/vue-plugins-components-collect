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
}

export const defaultProps = {
  modelValue: () => ({}),
  data: () => [],
  readonly: false,
} as const;
