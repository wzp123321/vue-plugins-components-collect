import {
  ComponentQrCode,
  ComponentPagination,
  ComponentYearRangePicker,
  ComponentDragLayout,
  ComponentLayoutDrag,
} from './index';

export const customComponents: { description: string; component: any }[] = [
  {
    description: '扫码',
    component: ComponentQrCode,
  },
  {
    description: '分页器',
    component: ComponentPagination,
  },
  {
    description: '年范围选择',
    component: ComponentYearRangePicker,
  },
  {
    description: '拖拽',
    component: ComponentDragLayout,
  },
  {
    description: '拖拽',
    component: ComponentLayoutDrag,
  },
];
