<!--
 * 实时告警 / 实时事件页面
 *
 * 与 alarmAffix.vue 的差异：
 *   - 不渲染 AlarmIconFloat / AlarmNotification 弹层
 *   - 直接组合弹框内业务组件（tab + actionbar + hintbar + searchbar + table + drawer）
 *
 * 改造要点（与 alarmAffix.vue 一致的 bundle 装配方式）：
 *   1. 容器在 onSetup 阶段调一次 useTeAlBundle,拿到完整 services 闭包
 *   2. 通过 provide(TE_AL_SERVICES_KEY, services) 注入子树
 *   3. 子组件全部通过 inject 取 services,不再持有单例
 *   4. 暴露对外事件：
 *      - @config-saved(payload) 本页表格配置保存成功,带最新 config
 *        用途:全局悬浮框收到后调用 updateConfig 同步
 *      - @config-updated(payload) 接收到外部"配置已更新"事件
 *        用途:全局悬浮框配置保存后反向通知本页表格刷新
 *   5. 通过 expose() 暴露方法供外部调用:
 *      - updateConfig(next) 直接写入最新 config（重置筛选并刷新表格）
 */
-->
<template>
  <div class="home-realtime-alarm-v2">
    <div class="hra-header">
      <TeAlarmTabWithBadge
        :model-value="activeTab"
        @update:model-value="onTabChange"
      />
      <TeAlarmActionBar
        :type="activeTab"
        :show-close="false"
        @open-setting="onOpenSetting"
        @config-saved="onConfigSaved"
      />
    </div>

    <div class="hra-body">
      <TeAlarmHintBar />
      <TeAlarmSearchBar
        :filters="filters"
        :level-options="levelOptions"
        :professional-options="professionalOptions"
        :type="activeTab"
        :has-selection="selectedRows.length > 0"
        :saving="remarkDialogVisible"
        @filter-change="onFilterChange"
        @batch-confirm="onBatchConfirm"
      />
      <div class="hra-table">
        <TeAlarmDataTable
          :data="tableData"
          :loading="tableLoading"
          :show-alarm-status="activeTab === AlarmType.ALARM"
          :selection="selectedRows"
          :page-num="pageNum"
          :page-size="pageSize"
          :total="total"
          @update:selection="handleSelectionChange"
          @row-confirm="onRowConfirm"
          @view="onView"
          @page-change="onPageChange"
        />
      </div>
    </div>

    <TeAlarmSettingDrawer
      v-model="settingVisible"
      @config-saved="onConfigSaved"
    />

    <TeAlarmRemarkDialog
      v-model="remarkDialogVisible"
      :saving="remarkSaving"
      @confirm="onRemarkConfirm"
    />

    <TeAlarmDetail
      :axios-instance="axiosInstance"
      :user-name="userName"
      ref="alarmDetailRef"
      @handle-sure="onAlarmDetailSure"
    />
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { computed, onMounted, onUnmounted, ref, provide } from 'vue';
import {
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmSettingDrawer,
  TeAlarmRemarkDialog,
  TeAlarmDetail,
  useTeAlBundle,
  useAlarmFilters,
  useAlarmTableData,
  useAlarmConfirm,
  TE_AL_SERVICES_KEY,
  AlarmLevelItemDto,
  AlarmType,
  SystemItemDto,
  type AlarmFilters,
  type AlarmInfo,
  type AlarmNoticeConfigDto,
} from '@/components/lib';

defineOptions({ name: 'HomeRealtimeAlarmNew' });

const emit = defineEmits<{
  /** 本页抽屉配置保存成功,带最新 config,供全局悬浮框同步 */
  (event: 'config-saved', config: AlarmNoticeConfigDto): void;
  /** 全局悬浮框配置保存后反向通知本页表格刷新 */
  (event: 'config-updated', config: AlarmNoticeConfigDto): void;
}>();

const userName = 'admin';
const systemCode = 'ims';

const getHeaders = () => {
  return {
    tenantCode: '700',
    'ts-token':
      '4b8fe705962c48428199a4ddd622dca0de4a53ea7715a2bb22e85291d7ae380f1784793527637',
    loginName: 'wanzhipeng',
    'ts-repeat': 'authorization',
    empId: '936899492619584',
    empName: '%E4%B8%87%E7%9B%B4%E9%B9%8F',
    userId: '936899492889920',
    userName: encodeURIComponent('万直鹏'),
  };
};

/**
 * demo 演示用 axios 实例
 * - 真实业务系统应注入统一 axios（带 baseURL / 拦截器 / token 等）
 * - demo 中 mock 默认开启，axios 不会被真正调用，但仍要求传一个合法实例
 */
const axiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: getHeaders(),
});

const spaceCodeList = ref([
  'TZSZ07',
  'TZSZ01',
  'TZSZ02',
  'TZSZ03',
  'TZSZ08',
  'TZSZ10',
  'TZSZ12',
  'TZSZ13',
  'TZSZ14',
  'TZSZ15',
  'TZSZ16',
  'TZSZ19',
  'TZSZ20',
  'TZSZ21',
]);

/* ============ Bundle 装配：与 alarmAffix 隔离,各持一份 services 闭包 ============ */
const services = useTeAlBundle({
  axiosInstance,
  systemCode,
  spaceCodeList: spaceCodeList.value,
});
provide(TE_AL_SERVICES_KEY, services);

const { alarmConfigData: config, fetchConfig, setConfig } = services.config;

const { filters, resetFilters } = useAlarmFilters(config, {
  spaceCodeList: spaceCodeList.value,
});

/* ============ UI 状态 ============ */
const configReady = ref(false);

const activeTab = ref<AlarmType>(AlarmType.ALARM);
const selectedRows = ref<AlarmInfo[]>([]);
const settingVisible = ref(false);

const {
  tableData,
  total,
  loading: tableLoading,
  pageNum,
  pageSize,
  refresh,
  onPageChange,
  startPolling,
  stopPolling,
} = useAlarmTableData(services, filters, activeTab);

const {
  onRowConfirm,
  onRemarkConfirm,
  onBatchConfirm,
  remarkDialogVisible,
  remarkSaving,
} = useAlarmConfirm(services.axiosInstance, {
  activeTab,
  selectedRows,
  refresh,
  startPolling,
});

const levelOptions = computed<AlarmLevelItemDto[]>(() =>
  (config.value.subscribeAlarmLevelList ?? []).filter((item) => item.selected),
);

const professionalOptions = computed<SystemItemDto[]>(() =>
  (config.value.subscribeSystemList ?? []).filter((item) => item.selected),
);

/* ============ 容器 handler（事件驱动） ============ */

const handleSelectionChange = (rows: AlarmInfo[]) => {
  selectedRows.value = rows;
};

const onTabChange = (tab: AlarmType) => {
  activeTab.value = tab;
  resetFilters();
  refresh();
};

const onFilterChange = (partial: Partial<AlarmFilters>) => {
  Object.assign(filters.value, partial);
  // 筛选变化时重置到第 1 页
  pageNum.value = 1;
  refresh();
};

const onOpenSetting = () => {
  settingVisible.value = true;
};

const onConfigSaved = (savedConfig: AlarmNoticeConfigDto) => {
  // 抽屉保存后:重置搜索默认值 + 刷新表格
  resetFilters();
  refresh();
  // 上抛给父级(业务容器 / app.vue)
  emit('config-saved', savedConfig);
};

const alarmDetailRef = ref<InstanceType<typeof TeAlarmDetail>>();
const onView = (row: AlarmInfo) => {
  alarmDetailRef.value?.initDialog(
    Number(row.id),
    activeTab.value,
    row.operationStatus,
    row.highPrecisionFlag ?? '0',
    row?.historyFlag || '0', // 确认不要这个字段了， 0 表示不开启低精度告警
  );
};

/**
 * 详情弹框确认告警成功 → 按当前查询条件刷新表格
 * - TeAlDetail.handleSure 由 AlarmRemarkDialog.confirm 触发,内部已调 batchConfirmAlarm
 * - refresh 来自本闭包 useAlarmTableData,内部读 filters + activeTab + 分页,符合"按原查询条件"语义
 */
const onAlarmDetailSure = () => {
  refresh();
};

/* ============ 对外暴露方法（供父级 / 兄弟容器调用） ============ */
/**
 * 外部配置已更新（不做网络请求,直接写入） + 重置筛选 + 刷新表格
 */
const updateConfig = (next: AlarmNoticeConfigDto) => {
  setConfig(next);
  resetFilters();
  refresh();
};

defineExpose({ updateConfig });

onMounted(async () => {
  const remoteConfig = await fetchConfig();
  if (remoteConfig) {
    configReady.value = true;
    resetFilters();
    await refresh();
    startPolling();
  } else {
    configReady.value = false;
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style lang="less" scoped>
.home-realtime-alarm-v2 {
  width: 100%;
  height: 400px;
  border: 1px solid var(--te-border-color-divider, rgba(232, 232, 232, 1));
  box-sizing: border-box;
  background: var(--te-bg-color-overlay, rgba(255, 255, 255, 1));
  box-shadow: 0px 6px 18px 6px rgba(0, 0, 0, 0.06),
    0px 4px 12px rgba(0, 0, 0, 0.08), 0px 2px 6px -3px rgba(0, 0, 0, 0.1);
  padding: 16px 16px 16px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hra-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.hra-body {
  flex: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .hra-table {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
