// 注册 element-plus 单元格编辑器为 vxe 渲染器
// 这样 vxe 网格（虚拟滚动/框选/填充/键盘流）保留，而单元格编辑控件用 el-input / el-input-number / el-select / el-date-picker。
//
// 本文件职责：把 4 个 element-plus 编辑器（Text/Number/Select/Date）封装成 vxe 渲染器，并统一
// 提供一个 registerAllRenderers() 入口把"编辑渲染器 + 显示渲染器"一起挂到 vxe 的 renderer 上。
//
// 协作模块：
//   - vxe-table 的 renderer.add：注册渲染器（带 'dt-el-*' / 'dt-cell-display' 命名空间前缀）；
//   - ./TextEditor|NumberEditor|SelectEditor|DateEditor：实际编辑组件；
//   - ./display：非编辑态显示渲染器；
//   - 主组件：import 并调用 registerAllRenderers() 一次完成注册。
//
// ⚠️ 坑：编辑单元格必须用 element-plus 组件、输入框无边框（box-shadow:none，见主组件 .dt-el-editor），
// 编辑不高亮整列；autofocus 指向 element-plus 内部可聚焦元素，保证进入编辑态自动聚焦。
import { h } from 'vue';
import { renderer as vxeRenderer } from 'vxe-table';
import TextEditor from './TextEditor.vue';
import NumberEditor from './NumberEditor.vue';
import SelectEditor from './SelectEditor.vue';
import DateEditor from './DateEditor.vue';
import FilterPanel from './FilterPanel.vue';
import { renderCellDisplay } from './display';

// 通用编辑渲染器：把 modelValue 绑定到 row[field]，变更时写回并标记脏数据
// 注意：直接改 row[field] + row.__dirty=true 是写入约定（与核心校验/标脏解耦，由核心读取后重校）。
const makeEditRenderer = (Comp: any) => (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  return [
    h(Comp, {
      modelValue: row[field],
      options: renderOpts.options || [],
      'onUpdate:modelValue': (v: any) => {
        row[field] = v;
        Object.assign(row, { __dirty: true });
      },
    }),
  ];
};

let registered = false;
export const registerElRenderers = () => {
  const r = vxeRenderer as any;
  if (!r?.add || registered) return;
  // 重复注册保护：若已存在 'dt-el-text'，视为已注册过，直接返回（避免热更新/二次调用报错）
  if (r.get?.('dt-el-text')) {
    registered = true;
    return;
  }
  // autofocus 指向 element-plus 编辑器内部可聚焦元素，编辑开始时自动聚焦
  r.add('dt-el-text', { autofocus: '.el-input__inner', renderEdit: makeEditRenderer(TextEditor) });
  r.add('dt-el-number', { autofocus: '.el-input__inner', renderEdit: makeEditRenderer(NumberEditor) });
  r.add('dt-el-select', { autofocus: '.el-select__selection', renderEdit: makeEditRenderer(SelectEditor) });
  r.add('dt-el-date', { autofocus: '.el-input__inner', renderEdit: makeEditRenderer(DateEditor) });
  registered = true;
};

// 页面启动时统一注册：element-plus 编辑渲染器 + 单元格显示渲染器 + 列筛选面板
export const registerAllRenderers = () => {
  const r = vxeRenderer as any;
  if (!r?.add) return;
  // ⚠️ 坑：vxe 4 的"显示渲染器"字段是 renderTableDefault / renderDefault，
  // 不是 renderCell（cell.js:464 取 renderer.get(name).renderTableDefault）。写成 renderCell 会静默不生效：
  // 单元格退化成纯文本 —— 下拉变彩色 tag、数字右对齐、条件格式数据条全部消失。
  if (!r.get?.('dt-cell-display')) r.add('dt-cell-display', { renderTableDefault: renderCellDisplay });
  // 筛选面板独立判重：不放进 registerElRenderers，避免那里"已注册就整体 return"把它漏掉（HMR 场景）
  if (!r.get?.('dt-filter')) {
    r.add('dt-filter', { renderFilter: (_opts: any, params: any) => h(FilterPanel, { column: params.column }) });
  }
  registerElRenderers();
};
