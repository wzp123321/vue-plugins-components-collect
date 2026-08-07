/**
 * Select 下拉选择组件 Props 定义
 * @description 下拉选择组件，支持单选/多选、搜索过滤、远程加载、标签折叠等
 */
import type { CSSProperties } from 'vue';

/** 选项数据结构 */
export interface SelectOption {
  /** 选项显示文本 */
  label: string;
  /** 选项值 */
  value: string | number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 副标题，显示在 label 下方（需配合 `hasSubText=true`） */
  subText?: string;
}

/** 输入框尺寸 */
export type SelectSize = 'default' | 'small';

export interface TsmSelectProps {
  // ========== 数据 ==========
  /** 双向绑定值，单选为 `string|number`，多选为 `(string|number)[]` */
  modelValue: string | number | (string | number)[];
  /**
   * 选项列表
   *
   * - 非分页模式：传入全量数据，组件内部 filterable 本地过滤
   * - 分页模式（`pagination=true`）：父组件逐页追加，触底时通过 `@load-more` 通知加载下一页
   * - 远程搜索模式（`remote=true`）：由父组件通过 `remoteMethod` 控制，搜索结果直接替换此数组
   */
  options: SelectOption[];

  // ========== 选择模式 ==========
  /** 是否多选，开启后 `modelValue` 为数组类型 */
  multiple: boolean;
  /**
   * 多选最大可选数量，`0` 为不限制
   *
   * @dependency 仅 `multiple=true` 时有效
   */
  multipleLimit: number;

  // ========== 展示 ==========
  /** 输入框尺寸 */
  size: SelectSize;
  /** 是否禁用 */
  disabled: boolean;
  /** 是否只读，开启后渲染为纯文本展示 */
  readonly: boolean;
  /** 表单字段名（配合 tsm-form 使用） */
  name: string;
  /** 未选择时的占位文本 */
  placeholder: string;
  /** 弹出面板标题 */
  title: string;
  /** 是否可清除，开启后在选中值右侧显示清除图标 */
  clearable: boolean;
  /**
   * 是否启用副标题双行布局
   *
   * `true` 时选项行展示 `label` + `subText` 双行，`false` 时仅展示 `label` 单行。
   * 需配合 `SelectOption.subText` 使用
   */
  hasSubText: boolean;

  // ========== 多选标签折叠 ==========
  /**
   * 是否折叠多余标签，超出 `maxCollapseTags` 的标签显示为 `+N`
   *
   * @dependency 仅 `multiple=true` 时有效
   */
  collapseTags: boolean;
  /**
   * 折叠后显示的最大标签数
   *
   * @dependency 仅 `collapseTags=true` 时有效
   */
  maxCollapseTags: number;

  // ========== 搜索/远程 ==========
  /**
   * 是否可搜索过滤
   *
   * - `true` 时弹出面板顶部显示搜索栏
   * - 当 `remote=false`（默认）：本地过滤 `options`，可配合 `filterMethod` 自定义匹配规则
   * - 当 `remote=true`：搜索关键词通过 `remoteMethod` 交由父组件处理，组件内部不做过滤
   */
  filterable: boolean;
  /**
   * 自定义本地过滤方法
   *
   * @param value - 搜索关键词
   * @param option - 当前选项
   * @returns 是否匹配
   * @dependency 仅 `filterable=true` 且 `remote=false` 时生效
   */
  filterMethod?: (value: string, option: SelectOption) => boolean;
  /**
   * 是否远程搜索
   *
   * 开启后搜索行为完全由父组件控制：
   * - 必须同时提供 `remoteMethod` 处理搜索关键词
   * - 搜索时组件 emit `search` 事件，父组件异步获取数据后更新 `options`
   * - 加载过程中设置 `loading=true` 展示加载状态
   * - 与 `pagination` 组合时：搜索 → 父组件替换 `options`（重置列表）；触底 → emit `load-more`（追加列表）。
   *
   * @dependency 需要 `filterable=true` 搜索栏才能显示；强依赖 `remoteMethod`
   */
  remote: boolean;
  /**
   * 远程搜索方法，用户输入关键词时回调
   *
   * @param keyword - 搜索关键词，空字符串表示清空搜索
   * @dependency 仅 `remote=true` 时有效，强烈建议提供
   */
  remoteMethod?: (keyword: string) => void;
  /**
   * 远程搜索加载中状态（外部控制）
   *
   * `true` 时弹出面板中央显示 loading 动画
   *
   * @dependency 配合 `remote=true` 使用
   */
  loading: boolean;
  /**
   * 搜索栏占位文本
   *
   * @dependency 仅 `filterable=true` 时有效
   */
  searchPlaceholder: string;
  /**
   * 多选时底部确认按钮文字
   *
   * @dependency 仅 `multiple=true` 时有效
   */
  confirmText: string;

  // ========== 分页加载 ==========
  /**
   * 是否启用分页模式
   *
   * 开启后弹出面板的选项列表支持滚动触底加载更多：
   * - 触底时 emit `load-more` 事件，父组件加载下一页数据后**追加**到 `options`
   * - 加载过程中设置 `paginationLoading=true`，列表底部显示 loading
   * - 全部加载完毕后设置 `finished=true`，列表底部显示 `finishedText`，不再触发 `load-more`
   *
   * 与 `remote` 的关系：
   * - 仅 `pagination=true`：本地过滤 + 分页追加，搜索仅过滤已加载数据
   * - `pagination=true` + `remote=true`：远程搜索 + 分页。搜索时父组件**替换** `options`（新数据集首页），触底时**追加**（当前数据集下一页）。**注意**：搜索会"侵占"之前已加载的 options，如需保持搜索前options，父组件需自行缓存以便清空关键词时恢复
   */
  pagination: boolean;
  /**
   * 分页加载中状态（外部控制）
   *
   * `true` 时列表底部显示 loading 动画，且不会重复触发 `load-more`
   *
   * @dependency 仅 `pagination=true` 时有效
   */
  paginationLoading: boolean;
  /**
   * 全部数据加载完毕
   *
   * `true` 时列表底部显示 `finishedText`，且不再触发 `load-more` 事件
   *
   * @dependency 仅 `pagination=true` 时有效
   */
  finished: boolean;
  /**
   * 加载完毕提示文案
   *
   * @default '没有更多了'
   * @dependency 仅 `pagination=true` 且 `finished=true` 时显示
   */
  finishedText: string;

  // ========== 通用 ==========
  /** 自定义类名 */
  customClass: string;
  /** 自定义样式 */
  customStyle: CSSProperties;
}

export const defaultProps = {
  modelValue: '',
  options: () => [],
  multiple: false,
  multipleLimit: 0,
  size: 'default' as SelectSize,
  disabled: false,
  readonly: false,
  name: '',
  placeholder: '请选择',
  title: '请选择',
  clearable: false,
  hasSubText: false,
  collapseTags: false,
  maxCollapseTags: 1,
  filterable: false,
  remote: false,
  loading: false,
  searchPlaceholder: '请输入关键词搜索',
  confirmText: '确定',
  pagination: false,
  paginationLoading: false,
  finished: false,
  finishedText: '没有更多了',
  customClass: '',
  customStyle: () => ({}),
} as const;
