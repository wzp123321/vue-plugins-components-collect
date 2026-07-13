import TeDepartmentDemo from '../te-department/te-department.vue';
import TeEmployeeGroupDemo from '../te-employee-group/te-employee-group.vue';
import TeEmployeeScopeV2Demo from '../te-employee-scope-v2/te-employee-scope-v2.vue';
import TePrintQrDemo from '../te-print-qr/te-print-qr.vue';
import TePrintTemplateViewDemo from '../te-print-template-view/te-print-template-view.vue';
import TePrintOneCodeDemo from '../te-print-one-code/te-print-one-code.vue';
import TeTitleDemo from '../te-title/te-title.vue';
import TeQrcodeViewDemo from '../te-qrcode-view/te-qrcode-view.vue';
import TeDragDesignDemo from '../te-drag-design/te-drag-design.vue';
import TeSpaceSelectDemo from '../te-space-select/te-space-select.vue';
import TeProjectSelectDemo from '../te-project-select/te-project-select.vue';
import TeIconLibDemo from '../te-icon-lib/te-icon-lib.vue';
import TeSpaceAttributeDemo from '../te-space-attribute/te-space-attribute.vue';
import TeSpaceZoneTreeDemo from '../te-space-zone-tree/te-space-zone-tree.vue';

export const teCustomComponents: { description: string; component: any }[] = [
  { description: 'te-drag-design', component: TeDragDesignDemo },
  { description: 'te-qrcode-view', component: TeQrcodeViewDemo },
  { description: 'te-print-template-view', component: TePrintTemplateViewDemo },
  { description: 'te-print-one-code', component: TePrintOneCodeDemo },
  { description: 'te-title', component: TeTitleDemo },
  { description: 'te-department', component: TeDepartmentDemo },
  { description: 'te-employee-group', component: TeEmployeeGroupDemo },
  { description: 'te-employee-scope-v2', component: TeEmployeeScopeV2Demo },
  { description: 'te-print-qr', component: TePrintQrDemo },
  { description: 'te-space-select', component: TeSpaceSelectDemo },
  { description: 'te-project-select', component: TeProjectSelectDemo },
  { description: 'te-icon-lib', component: TeIconLibDemo },
  { description: 'te-space-attribute', component: TeSpaceAttributeDemo },
  { description: 'te-space-zone-tree', component: TeSpaceZoneTreeDemo },
];
