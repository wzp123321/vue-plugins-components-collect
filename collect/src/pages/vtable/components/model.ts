import VtBasic from './vt-basic.vue';
import VtEditors from './vt-editors.vue';

/** VTable 收集页注册表：壳页 vtable.vue 遍历渲染，新增示例在此挂载 */
export const customComponents = [
  { description: '基础 ListTable（Canvas 高性能渲染）', component: VtBasic, span: 12 },
  {
    description: '单元格编辑（Input / TextArea / Date / List 四种编辑器）',
    component: VtEditors,
    span: 24,
  },
];
