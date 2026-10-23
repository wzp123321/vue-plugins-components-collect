<!--
 * 告警/事件提示音开关 + 设置 + 关闭
 * 静音按钮展示/点击均与 config 绑定:点击翻转 + saveConfig
-->
<template>
  <div class="alarm-action-bar">
    <te-button
      :type="muted ? 'danger' : 'default'"
      :disabled="saving"
      @click="handleToggleMute"
    >
      <icon-turn-off-microphone v-if="muted" />
      <icon-microphone v-else />
      <span>
        {{ muted ? '已静音' : '语音提示已开启' }}
      </span>
    </el-button>
    <te-button @click="onOpenSetting">
      <icon-setting />
      设置
    </el-button>
    <te-button v-if="props.showClose" link @click="handleClose">
      <icon-close />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import {
  IconSetting,
  IconMicrophone,
  IconTurnOffMicrophone,
  IconClose,
} from '@arco-iconbox/vue-te';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import {
  AlarmType,
  SwitchFlag,
  type AlarmNoticeConfigVO,
} from '../api/index.api';
import { cloneDeep } from 'lodash';

defineOptions({ name: 'TeAlarmActionBar' });

const props = defineProps<{
  /** 当前 tab 类型：告警 / 事件 */
  type: AlarmType;
  showClose: boolean;
}>();

const emit = defineEmits<{
  (event: 'open-setting'): void;
  (event: 'close'): void;
  /**
   * 静音切换成功(与抽屉的 config-saved 区分)
   * - 静音只切一个字段(alarmSoundSwitch / eventSoundSwitch),不重置筛选、不刷新表格
   * - 上层容器(AlarmMainDialog / HomeRealtimeAlarmNew)收到后只 emit('config-saved') 上抛给父级用于跨容器配置同步
   */
  (event: 'mute-saved', config: AlarmNoticeConfigVO): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmActionBar] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const { alarmConfigData: config, saveConfig } = services.config;

/* 静音态 = 当前 tab 对应的声音开关取反 */
const muted = computed(() => {
  if (props.type === AlarmType.EVENT) {
    return config.value.eventSoundSwitch !== SwitchFlag.ON;
  }
  return config.value.alarmSoundSwitch !== SwitchFlag.ON;
});

const saving = ref(false);

/**
 * 切换静音状态
 */
const handleToggleMute = async () => {
  if (saving.value) {
    return;
  }
  saving.value = true;
  try {
    // 深拷贝避免直接改 store 内的响应式对象
    const next: AlarmNoticeConfigVO = cloneDeep(config.value);
    if (props.type === AlarmType.EVENT) {
      next.eventSoundSwitch =
        next.eventSoundSwitch === SwitchFlag.ON
          ? SwitchFlag.OFF
          : SwitchFlag.ON;
    } else {
      next.alarmSoundSwitch =
        next.alarmSoundSwitch === SwitchFlag.ON
          ? SwitchFlag.OFF
          : SwitchFlag.ON;
    }
    // saveConfig 成功会 setConfig,config 响应式更新 → 视图自然变化
    const savedConfig = await saveConfig(next);
    // 静音切换用独立事件,容器收到后不做 reset/refresh
    emit('mute-saved', savedConfig);
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败');
  } finally {
    saving.value = false;
  }
};

const onOpenSetting = () => emit('open-setting');
const handleClose = () => emit('close');
</script>
<style lang="less" scoped>
.alarm-action-bar {
  display: inline-flex;
  align-items: center;
  :deep(.te-button) span {
    display: flex;
    align-items: center;
    gap: var(--te-space-4);
  }
}
</style>
