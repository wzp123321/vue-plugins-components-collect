import { TeFormTag } from './te-form-tag';
import { Te401 } from './te-401';
import { forIn } from 'lodash';
import { TeFormUpload } from './te-form-upload';
import { TeTablebar } from './te-tablebar';
import { TeSelectSubContent } from './te-select-sub-content';
import { TeSelectSubContentV2 } from './te-select-sub-content-v2';
import { TeUploadImagecropping } from './te-upload-imagecropping';
import { TeModulePagetab } from './te-module-pagetab';
import { TeSearch } from './te-search';
import { TeSidenav } from './te-sidenav';
import { TeLayoutTree } from './te-layout-tree';
import { TeTreeEdit } from './te-tree-edit';
import { TeSegmented } from './te-segmented';
import { TeImport } from './te-import';
import {
  TeModuleTable,
  ColSettingBtn,
  TeTableButtonGroup,
} from './te-module-table';
import { TeGlobalnav } from './te-globalnav';
import { TeTagsView } from './te-tags-view';
import { TeLayoutOne } from './te-layout-one';
import { TeSpaceSelect } from './te-space-select';
import { TeDateSwitch } from './te-date-switch';
import { TeDynamicTable } from './te-dynamic-table';
import type { globalnavMenuItem } from './te-globalnav';
import ElementPlus from '@tiansu/element-plus';
import type { ConfigProviderContext } from '@tiansu/element-plus/lib/components/config-provider';
import { TeImmediateTransfer } from './te-immediate-transfer';
import type { Columns, DynamicTableProps } from './te-dynamic-table';
import type { DateSwitchProps } from './te-date-switch';
import {
  TeWorkflowTaskDetail,
  TeWorkflowLog,
  TeWorkflowButton,
  TeWorkflowBaseinfo,
  TeWorkflowGraph,
  TeWorkflowUtil,
} from './te-workflow';
import { TeEmployee } from './te-employee';
import { TeDepartment } from './te-department';
import { TeJob } from './te-job';
import { TeTitle } from './te-title';
import { TeLabel } from './te-label';
import { TeLayoutDrag } from './te-layout-drag';
import { TePrintQr } from './te-print-qr';
export * from './constant';
export * as FormInstanceDTO from './models/FormInstanceDTO';
export * as DepartmentDTO from './models/DepartmentDTO';
export * as TaskDetailDTO from './models/TaskDetailDTO';
export * as ActionInfo from './models/ActionInfo';
export * as ProcessInstanceActivityLogDTO from './models/ProcessInstanceActivityLogDTO';
export * as ActionButton from './models/ActionButton';
import { TeSpaceAttribute } from './te-space-attribute';
import { TeEmployeeInfo } from './te-employee-info';
// 临时库
export * from '../minor';
import {
  TeAlarmAffix,
  TeAlarmSettingDrawer,
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmNotification,
  TeAlarmSubTitle,
  TeAlarmRemarkDialog,
  TeAlarmDetail,
  TeAlarmIconFloat,
  TeAlarmMainDialog,
} from './energy/te-alarm-affix';

const components = [
  TeFormTag,
  Te401,
  TeFormUpload,
  TeTablebar,
  TeSelectSubContent,
  TeSelectSubContentV2,
  TeUploadImagecropping,
  TeModulePagetab,
  TeSearch,
  TeSidenav,
  TeLayoutTree,
  TeTreeEdit,
  TeSegmented,
  TeModuleTable,
  TeGlobalnav,
  TeTagsView,
  TeLayoutOne,
  TeImmediateTransfer,
  TeImport,
  TeDateSwitch,
  TeDynamicTable,
  TeSpaceSelect,
  TeWorkflowTaskDetail,
  TeWorkflowLog,
  TeWorkflowButton,
  TeWorkflowBaseinfo,
  TeWorkflowGraph,
  TeEmployee,
  TeDepartment,
  TeJob,
  TeTitle,
  TeLabel,
  TeLayoutDrag,
  TePrintQr,
  TeAlarmAffix,
  TeAlarmSettingDrawer,
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmNotification,
  TeAlarmSubTitle,
  TeAlarmRemarkDialog,
  TeAlarmDetail,
  TeAlarmIconFloat,
  TeAlarmMainDialog,
];
const tsVuePlugin: any = {
  install(app: any, options?: ConfigProviderContext) {
    if (tsVuePlugin.installed) {
      // 判断是否安装，安装过就不继续往下执行
      return;
    }
    tsVuePlugin.installed = true;
    app.use(ElementPlus, options);
    // 遍历注册全局组件
    components.map((component) => {
      app.use(component);
    });
  },
};
export default tsVuePlugin;
export * from './te-immediate-transfer';
export * from './te-layout-drag';
export * from './te-form-tag';
export * from './te-401';
export * from './te-form-upload';
export * from './te-import';
export * from './te-module-table';
export * from './energy/te-alarm-affix';
export {
  TeLayoutDrag,
  TeFormTag,
  Te401,
  TeFormUpload,
  TeTablebar,
  TeSelectSubContent,
  TeSelectSubContentV2,
  TeUploadImagecropping,
  TeModulePagetab,
  TeSearch,
  TeSidenav,
  TeLayoutTree,
  TeTreeEdit,
  TeSegmented,
  TeModuleTable,
  TeGlobalnav,
  globalnavMenuItem,
  TeTagsView,
  ColSettingBtn,
  TeLayoutOne,
  TeTableButtonGroup,
  TeImmediateTransfer,
  TeImport,
  TeDateSwitch,
  TeDynamicTable,
  Columns,
  DateSwitchProps,
  DynamicTableProps,
  TeSpaceSelect,
  TeWorkflowTaskDetail,
  TeWorkflowLog,
  TeWorkflowButton,
  TeWorkflowBaseinfo,
  TeWorkflowGraph,
  TeWorkflowUtil,
  TeEmployee,
  TeDepartment,
  TeJob,
  TeTitle,
  TeLabel,
  TePrintQr,
  TeSpaceAttribute,
  TeEmployeeInfo,
  TeAlarmAffix,
  TeAlarmSettingDrawer,
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmNotification,
  TeAlarmSubTitle,
  TeAlarmRemarkDialog,
  TeAlarmDetail,
  TeAlarmIconFloat,
  TeAlarmMainDialog,
};
