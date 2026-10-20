/** 告警弹框模块入口(TeAlarmAffix) */
import TeAlarmAffix from './te-alarm-affix.vue';
import {
  TeAlarmSettingDrawer,
  TeAlarmIconFloat,
  TeAlarmMainDialog,
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmNotification,
  TeAlarmSubTitle,
  TeAlarmRemarkDialog,
  TeAlarmDetail,
} from './components/index';

export { default as TeAlarmAffix } from './te-alarm-affix.vue';

export * from './components/index';
export * from './hooks/index';
export * from './types/index';

export * from './api/index.api';

/* 子组件注册清单:标签名 -> 组件 */
const subComponents: ReadonlyArray<readonly [string, any]> = [
  ['te-alarm-setting-drawer', TeAlarmSettingDrawer],
  ['te-alarm-icon-float', TeAlarmIconFloat],
  ['te-alarm-main-dialog', TeAlarmMainDialog],
  ['te-alarm-tab-with-badge', TeAlarmTabWithBadge],
  ['te-alarm-action-bar', TeAlarmActionBar],
  ['te-alarm-hint-bar', TeAlarmHintBar],
  ['te-alarm-search-bar', TeAlarmSearchBar],
  ['te-alarm-data-table', TeAlarmDataTable],
  ['te-alarm-notification', TeAlarmNotification],
  ['te-alarm-sub-title', TeAlarmSubTitle],
  ['te-alarm-remark-dialog', TeAlarmRemarkDialog],
  ['te-alarm-detail', TeAlarmDetail],
];

// Vue 插件注册:app.use(TeAlarmAffix) 后可通过 <te-alarm-affix> 及上述 12 个子组件标签使用
// @ts-ignore
TeAlarmAffix.install = (app: any) => {
  app.component('te-alarm-affix', TeAlarmAffix);
  subComponents.forEach(([name, comp]) => {
    app.component(name, comp);
  });
};

export default TeAlarmAffix;
