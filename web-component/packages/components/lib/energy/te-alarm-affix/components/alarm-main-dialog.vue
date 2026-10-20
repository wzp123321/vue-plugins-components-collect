<!--
 * 告警主弹框容器
 * 事件驱动:子组件 emit → 容器 handler;表格"查看" → emit('view') 给父级
 * 设置抽屉内嵌:@config-saved → 上抛给父级
-->
<template>
  <te-dialog
    class="alarm-main-dialog-custom"
    :model-value="modelValue"
    title="告警通知"
    width="1280px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :close-on-press-escape="false"
    :append-to-body="true"
    :show-close="false"
    @update:model-value="handleModelValueChange"
    @open="onOpen"
  >
    <template #header>
      <div class="alarm-main-dialog-header">
        <TeAlarmTabWithBadge
          :model-value="activeTab"
          @update:model-value="onTabChange"
        />
        <TeAlarmActionBar
          :type="activeTab"
          :show-close="true"
          @open-setting="onOpenSetting"
          @close="onClose"
          @mute-saved="onMuteSaved"
        />
      </div>
    </template>
    <div class="alarm-main-dialog">
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

      <TeAlarmDataTable
        :data="tableData"
        :loading="loading"
        :show-alarm-status="activeTab === AlarmType.ALARM"
        :selection="selectedRows"
        :page-num="pageNum"
        :page-size="pageSize"
        :total="total"
        @update:selection="handleSelectionChange"
        @row-confirm="onRowConfirm"
        @view="(row) => emit('view', activeTab, row)"
        @page-change="onPageChange"
      />
    </div>
  </te-dialog>

  <TeAlarmSettingDrawer
    v-model="settingVisible"
    @config-saved="onConfigSaved"
  />

  <TeAlarmRemarkDialog
    v-model="remarkDialogVisible"
    :saving="remarkSaving"
    @confirm="onRemarkConfirm"
  />
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue';
import { TeDialog } from '@tiansu/element-plus';
import {
  TeAlarmTabWithBadge,
  TeAlarmActionBar,
  TeAlarmHintBar,
  TeAlarmSearchBar,
  TeAlarmDataTable,
  TeAlarmSettingDrawer,
  TeAlarmRemarkDialog,
} from './index';
import { useAlarmFilters } from '../hooks/useAlarmFilters';
import { useAlarmTableData } from '../hooks/useAlarmTableData';
import { useAlarmConfirm } from '../hooks/useAlarmConfirm';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import {
  AlarmType,
  type AlarmFilters,
  type AlarmInfo,
  type AlarmNoticeConfigVO,
} from '../api/index.api';

defineOptions({ name: 'TeAlarmMainDialog' });

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  /** 配置保存成功通知：父级 alarmAffix.vue 转发给全局悬浮框 */
  (event: 'config-saved', config: AlarmNoticeConfigVO): void;
  (event: 'view', type: string, row: AlarmInfo): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmMainDialog] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const { alarmConfigData: config } = services.config;
const { filters, resetFilters } = useAlarmFilters(config, {
  spaceCodeList: services.spaceCodeList,
});

/* ============ UI 状态 ============ */
const activeTab = ref<AlarmType>(AlarmType.ALARM);
const selectedRows = ref<AlarmInfo[]>([]);
const settingVisible = ref(false);

const {
  tableData,
  total,
  loading,
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

/** 告警等级选项 = subscribeAlarmLevelList 中已勾选 */
const levelOptions = computed(() =>
  (config.value.subscribeAlarmLevelList ?? []).filter((item) => item.selected),
);

/** 专业模块选项 = subscribeSystemList 中已勾选 */
const professionalOptions = computed(() =>
  (config.value.subscribeSystemList ?? []).filter((item) => item.selected),
);

/**
 * 弹窗显示状态变化时,刷新表格数据
 * @param isOpen 新的显示状态
 */
const handleModelValueChange = (isOpen: boolean) => {
  emit('update:modelValue', isOpen);
};

/**
 * 选择行变化时,刷新表格数据
 * @param rows 选中的行数据
 */
const handleSelectionChange = (rows: AlarmInfo[]) => {
  selectedRows.value = rows;
};

/**
 * 打开弹窗时,刷新表格数据并启动轮询更新
 * - refresh() 内部会先 fetchTable(分页)再 fetchAlarmEventCount(角标)
 */
const onOpen = () => {
  resetFilters();
  refresh();
  startPolling();
};

/**
 * 关闭弹窗时,停止轮询表格数据更新
 */
const onClose = () => {
  stopPolling();
  selectedRows.value = [];
  emit('update:modelValue', false);
};

/**
 * 切换 tab 时,刷新表格数据
 * @param tab 新的 tab 类型
 */
const onTabChange = (tab: AlarmType) => {
  activeTab.value = tab;
  resetFilters();
  refresh();
};
/**
 * 筛选变化时,刷新表格数据
 * @param partial 新的筛选条件
 */
const onFilterChange = (partial: Partial<AlarmFilters>) => {
  Object.assign(filters.value, partial);
  // 筛选变化时重置到第 1 页
  pageNum.value = 1;
  refresh();
};

/**
 * 打开设置抽屉
 */
const onOpenSetting = () => {
  settingVisible.value = true;
};

/**
 * 配置保存成功时(来自抽屉)→ 重置筛选 + 刷新表格 + 上抛给父级
 * @param savedConfig 保存的配置
 */
const onConfigSaved = (savedConfig: AlarmNoticeConfigVO) => {
  if (props.modelValue) {
    resetFilters();
    refresh();
  }
  // 配置同步交给使用方处理(demo.vue 监听 @config-saved 后 publishAffixAlarmConfig)
  emit('config-saved', savedConfig);
};

/**
 * 静音切换成功(来自 ActionBar)→ 不重置筛选 / 不刷新表格,只上抛给父级
 * - 静音只切 soundSwitch 字段,不影响表格分页 / 筛选条件 / tab 角标
 * @param savedConfig 保存的配置
 */
const onMuteSaved = (savedConfig: AlarmNoticeConfigVO) => {
  emit('config-saved', savedConfig);
};

/** 暴露 refresh 给父级:详情弹框 TeAlDetail.handleSure 触发"按原查询条件刷新" */
defineExpose({ refresh });
</script>

<style lang="less" scoped>
.alarm-main-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .alarm-data-table {
    flex: auto;
    overflow: hidden;
  }
}
</style>
<style lang="less">
.alarm-main-dialog-custom {
  height: calc(100% - 144px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .te-dialog__header {
    padding-top: 0;
    padding-bottom: 0;
  }
  .te-dialog__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 20px;
  }
}
</style>
