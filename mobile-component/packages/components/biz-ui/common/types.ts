import { type Component } from 'vue';

export interface Item {
  id: string;
  name: string;
  children?: Item[];
  // 可下钻：部门选择时需部门下有子部门，人员选择时需部门下有人员
  drillable?: boolean;
  subtitle?: string;
  organizationId?: string; // 组织id
  icon?: string | Component;
  // 顶部面包屑特殊节点类型：全部、本机构、共享机构、机构
  sdcType?: 'sdc-all' | 'sdc-local' | 'sdc-share' | 'sdc-org';
  disabled?: boolean;
}
