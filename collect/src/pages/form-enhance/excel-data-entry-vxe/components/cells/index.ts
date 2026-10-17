// 注册 element-plus 单元格编辑器为 vxe 渲染器
// 这样 vxe 网格（虚拟滚动/框选/填充/键盘流）保留，而单元格编辑控件用 el-input / el-input-number / el-select / el-date-picker。
import { h } from 'vue';
import { renderer as vxeRenderer } from 'vxe-table';
import TextEditor from './TextEditor.vue';
import NumberEditor from './NumberEditor.vue';
import SelectEditor from './SelectEditor.vue';
import DateEditor from './DateEditor.vue';
import { renderCellDisplay } from './display';

// 通用编辑渲染器：把 modelValue 绑定到 row[field]，变更时写回并标记脏数据
const makeEditRenderer = (Comp: any) => (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  return [
    h(Comp, {
      modelValue: row[field],
      options: renderOpts.options || [],
      'onUpdate:modelValue': (v: any) => {
        row[field] = v;
        row.__dirty = true;
      },
    }),
  ];
};

let registered = false;
export const registerElRenderers = () => {
  const r = vxeRenderer as any;
  if (!r?.add || registered) return;
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

// 页面启动时统一注册：element-plus 编辑渲染器 + 单元格显示渲染器
export const registerAllRenderers = () => {
  const r = vxeRenderer as any;
  if (r?.add && !r.get?.('dt-cell-display')) r.add('dt-cell-display', { renderCell: renderCellDisplay });
  registerElRenderers();
};
