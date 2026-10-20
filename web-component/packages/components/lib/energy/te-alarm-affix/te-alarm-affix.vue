<!--
  告警弹框模块入口(TeAlarmAffix)
  对外事件:@config-saved / @config-updated / @view
  对外方法(updateConfig)供父级 / 兄弟容器调用
-->
<template>
  <div class="te-alarm-affix">
    <!--
      拖拽透明遮罩:iframe 嵌入时 window pointermove/pointerup 被吞噬,
      拖拽期间在父文档铺全屏透明遮罩(z-index 高于 iframe 低于 icon),让指针始终落在父级文档
    -->
    <div v-show="isIconDragging" class="te-alarm-affix-mask" />
    <TeAlarmIconFloat
      :system-code="systemCode"
      @open="openMainDialog"
      @drag-start="onIconDragStart"
      @drag-end="onIconDragEnd"
    />
    <TeAlarmNotification
      :alarm="notification.currentAlarm.value"
      :visible="notification.visible.value"
      @view="onNotificationClick"
      @dismiss="onNotificationDismiss"
    />
    <TeAlarmMainDialog
      v-if="configReady"
      ref="mainDialogRef"
      v-model="mainDialogVisible"
      @config-saved="onConfigSaved"
      @view="onTableView"
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
import { ref, onMounted, onBeforeUnmount, provide } from 'vue';
import type { AxiosInstance } from 'axios';
import {
  TeAlarmIconFloat,
  TeAlarmMainDialog,
  TeAlarmNotification,
  TeAlarmDetail,
} from './components/index';
import { useTeAlBundle, buildPollingDeps } from './hooks/useTeAlBundle';
import { useAlarmPolling } from './hooks/useAlarmPolling';
import { TE_AL_SERVICES_KEY } from './types/injection';
import type {
  AlarmInfo,
  AppSystemCode,
  AlarmNoticeConfigVO,
} from './api/index.api';

defineOptions({ name: 'TeAlarmAffix' });

const props = withDefaults(
  defineProps<{
    systemCode: AppSystemCode; // 系统编码
    userName: string; // 用户名
    axiosInstance: AxiosInstance; // 请求实例
    spaceCodeList?: string[]; // 当前所选院区 id 列表
  }>(),
  {
    spaceCodeList: () => [] as string[],
  },
);

const emit = defineEmits<{
  /** 全局悬浮框配置保存成功,带最新配置,供兄弟容器(首页表格)刷新 */
  (event: 'config-saved', config: AlarmNoticeConfigVO): void;
  /** 兄弟容器配置保存后反向通知全局悬浮框更新 config */
  (event: 'config-updated', config: AlarmNoticeConfigVO): void;
  (event: 'view', type: string, row: AlarmInfo): void;
}>();

const { systemCode, axiosInstance, spaceCodeList } = props;

/* Bundle 装配:全模块唯一状态来源 */
const services = useTeAlBundle({
  axiosInstance,
  systemCode,
  spaceCodeList,
});
provide(TE_AL_SERVICES_KEY, services);

const { config, notification, sound, fetchAlarmEventCount } = services;
const { isSystemInScope, fetchConfig } = config;

/* 应用启动:拉配置 */
const configReady = ref(false);

/* UI 状态 */
const mainDialogVisible = ref(false);

const openMainDialog = () => {
  mainDialogVisible.value = true;
};

/* 拖拽遮罩状态:解决 iframe 嵌入场景 window 指针事件被吞噬 */
const isIconDragging = ref(false);

const onIconDragStart = () => {
  isIconDragging.value = true;
};

const onIconDragEnd = () => {
  isIconDragging.value = false;
};

/* 轮询:listPopup 自动打开主弹框 */
const polling = useAlarmPolling(buildPollingDeps(services), {
  onAutoOpenDialog: () => {
    mainDialogVisible.value = true;
  },
});

/* 告警详情 */
const alarmDetailRef = ref<InstanceType<typeof TeAlarmDetail>>();
/* 主弹框(用于在详情确认后按原查询条件刷新表格) */
const mainDialogRef = ref<InstanceType<typeof TeAlarmMainDialog>>();

/**
 * 详情弹框确认告警成功 → 按主弹框当前查询条件刷新表格
 * - TeAlarmDetail.handleSure 由 AlarmRemarkDialog.confirm 触发,内部已调 batchConfirmAlarm
 * - 这里只负责通知主弹框重拉分页表格 + 角标,不复用 polling.pollOnce
 *   (pollOnce 走的是 queryRealTimeAlarm,与分页接口不同,不会更新 tableData)
 */
const onAlarmDetailSure = () => {
  mainDialogRef.value?.refresh();
};

/** 点击告警卡片打开详情 */
const onNotificationClick = () => {
  if (!notification.currentAlarm.value) {
    return;
  }
  alarmDetailRef.value?.initDialog(
    notification.currentAlarm.value?.id as number,
    notification.currentAlarm.value?.alarmEventType as string,
    notification.currentAlarm.value?.operationStatus ?? '',
    notification.currentAlarm.value?.highPrecisionFlag || '0',
    notification.currentAlarm.value?.historyFlag || '0', // 确认不要这个字段了， 0 表示不开启低精度告警
  );
};
/** 点击表格行打开详情 */
const onTableView = (type: string, row: AlarmInfo) => {
  alarmDetailRef.value?.initDialog(
    row.id,
    type,
    row.operationStatus,
    row.highPrecisionFlag ?? '0',
    row?.historyFlag || '0', // 确认不要这个字段了， 0 表示不开启低精度告警
  );
};

/** Toast 主动关闭:仅清空卡片 + 同步 badge,不停 TTS(语音播报独立于通知框) */
const onNotificationDismiss = async () => {
  notification.clearAlarm();
  await fetchAlarmEventCount();
};

/* 配置保存回调(来自 AlarmMainDialog 内嵌抽屉) */
const onConfigSaved = (savedConfig: AlarmNoticeConfigVO) => {
  notification.clearAlarm();
  sound.stop();
  const inScope = isSystemInScope(systemCode);
  if (!polling.isPolling.value && inScope) {
    polling.start();
  }
  emit('config-saved', savedConfig);
};

/* 生命周期 */
const init = async () => {
  const remoteConfig = await fetchConfig();
  if (!remoteConfig) {
    configReady.value = false;
    return;
  }
  if (!isSystemInScope(systemCode)) {
    configReady.value = false;
    return;
  }
  configReady.value = true;
  fetchAlarmEventCount();
  polling.start();
};

/**
 * 同步上游已落库的 config 到本地(由 demo.vue 监听 homeConfigChanged$ 后调用)
 * - 直接用上游已 saveConfig 成功的 next 写入本地 services.config,不再请求后端
 * - 顺手拉 1 次 count 同步 alarmTotal / eventTotal / badgeTotal(因为新配置下订阅等级/模块变了,count 应重算)
 * @param next 上游传入的最新 config(已 saveConfig 成功 + 广播)
 */
const updateConfig = (next: AlarmNoticeConfigVO) => {
  config.setConfig(next);
  fetchAlarmEventCount();
};

defineExpose({ updateConfig });

/**
 * 初始化
 */
onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  polling.stop();
  sound.stop();
  notification.clearAlarm();
});
</script>

<style lang="less" scoped>
.te-alarm-affix {
  .te-alarm-affix-mask {
    /* 全屏透明遮罩:z-index 高于 iframe 低于 icon,拖拽时指针落在父级文档,window pointer 监听正常触发 */
    position: fixed;
    inset: 0;
    z-index: 1999;
    background: transparent;
    cursor: grabbing;
  }
}
</style>
