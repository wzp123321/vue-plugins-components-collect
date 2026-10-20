import Layout from './Layout';
export default class WorkbenchConfigContent {
  // 配置项
  contentType: Nullable<string>;
  // 页面布局详情
  layout: Nullable<Layout>;
  // 配置详情json字符串(编辑时,对当前级别下全部数据的场景应用区信息做更新,不区分配置版本)
  configJsonStr: Nullable<string>;
}
