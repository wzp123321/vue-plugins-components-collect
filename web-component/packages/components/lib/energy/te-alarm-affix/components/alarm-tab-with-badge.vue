<!-- 告警/事件 Tab 切换 + 角标 -->
<template>
  <div class="alarm-tab-with-badge">
    <div
      :class="[
        'atwb-item',
        props.modelValue === AlarmType.ALARM ? 'atwb-item-active' : '',
      ]"
      @click="handleTabChange(AlarmType.ALARM)"
    >
      <te-badge :value="alarmCountText" :max="99">
        <span> 实时告警 </span>
      </el-badge>
    </div>
    <div
      :class="[
        'atwb-item',
        props.modelValue === AlarmType.EVENT ? 'atwb-item-active' : '',
      ]"
      @click="handleTabChange(AlarmType.EVENT)"
    >
      <te-badge :value="eventCountText" :max="99">
        <span> 实时事件 </span>
      </el-badge>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { ElBadge } from 'element-plus';
import { AlarmType } from '../api/index.api';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import { formatBadge } from '../utils';

defineOptions({ name: 'TeAlarmTabWithBadge' });

const props = defineProps<{
  modelValue: AlarmType;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: AlarmType): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmTabWithBadge] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const handleTabChange = (value: AlarmType) => {
  emit('update:modelValue', value);
};

const alarmCountText = computed(() => formatBadge(services.alarmTotal.value));
const eventCountText = computed(() => formatBadge(services.eventTotal.value));
</script>

<style lang="less" scoped>
.alarm-tab-with-badge {
  display: flex;
  align-items: center;
  gap: var(--te-space-40);
  .atwb-item {
    cursor: pointer;
    padding: 21px 0;
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    white-space: nowrap;
    &.atwb-item-active {
      position: relative;
      color: var(--te-color-primary);
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--te-color-primary);
        transition: all 0.3s ease-in-out;
      }
    }
  }
}
</style>
