<!--
 * Toast 通知卡片(同时只显示 1 个)
 * 等级彩色标签 / 告警对象 / 描述 / 底部进度条(从左向右消失)
 * duration=-1:进度条不显示,需手动关闭;duration>0:进度条结束触发 dismiss
-->
<template>
  <transition name="alarm-notification">
    <div
      v-if="visible && alarm"
      :key="alarm.id"
      class="alarm-notification"
      :style="getRootStyle()"
      @click="handleCardClick"
    >
      <header class="alarm-notification-header">
        <te-tag
          :type="mapTagTypeByAlarmLevel(props.alarm?.levelCode ?? '')"
          class="alarm-notification-level"
          effect="dark"
        >
          {{ mapAlarmLevelNameByLevel(props.alarm?.levelCode ?? '') }}
        </te-tag>
        <span
          :title="props.alarm?.deviceName ?? ''"
          class="alarm-notification-device"
        >
          {{ props.alarm?.deviceName ?? '' }}
        </span>
        <span class="alarm-notification-time">{{ getTimeText() }}</span>
        <icon-close
          class="alarm-notification-close"
          @click.stop="handleClose"
        />
      </header>

      <div
        class="alarm-notification-object"
        :title="props.alarm?.objectName ?? ''"
      >
        {{ props.alarm?.objectName ?? '' }}
      </div>

      <div
        class="alarm-notification-content"
        :title="props.alarm?.content ?? ''"
      >
        {{ props.alarm?.content ?? '' }}
      </div>

      <div
        v-if="showProgress"
        class="alarm-notification-progress"
        :style="getProgressStyle()"
        @animationend="handleProgressEnd"
      />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { TeTag } from '@tiansu/element-plus';
import { IconClose } from '@arco-iconbox/vue-te';
import { type AlarmNotifyItem } from '../api/index.api';
import {
  mapAlarmThemeColorByLevel,
  mapTagTypeByAlarmLevel,
  mapAlarmLevelNameByLevel,
} from '../utils';
import { TE_AL_SERVICES_KEY } from '../types/injection';

defineOptions({ name: 'TeAlarmNotification' });

const props = defineProps<{
  alarm: AlarmNotifyItem | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (event: 'view', alarm: AlarmNotifyItem): void;
  (event: 'dismiss'): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmNotification] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const { alarmConfigData: config } = services.config;

/** 弹窗停留时长(秒),-1 = 手动关闭 */
const popupDuration = computed<number>(() => {
  const raw = Number(config.value.popupStayTime ?? 5);
  if (Number.isNaN(raw)) return 5;
  return raw;
});

/** 是否展示自动倒计时进度条(仅 -1 手动关闭时不展示) */
const showProgress = computed<boolean>(() => popupDuration.value !== -1);

const getAnimationDuration = (): string =>
  `${Math.max(1, popupDuration.value)}s`;

/** ISO 8601 → HH:mm:ss */
const getTimeText = (): string => {
  const iso = props.alarm?.generationTime;
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (num: number) => (num < 10 ? `0${num}` : String(num));
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const getRootStyle = (): Record<string, string> => ({
  '--alarm-progress-duration': getAnimationDuration(),
});

const getProgressStyle = (): Record<string, string> => ({
  background: mapAlarmThemeColorByLevel(props.alarm?.levelCode ?? ''),
});

const handleCardClick = () => {
  if (props.alarm) {
    emit('view', props.alarm);
  }
};

const handleClose = () => emit('dismiss');

const handleProgressEnd = () => emit('dismiss');
</script>

<style lang="less" scoped>
.alarm-notification {
  position: fixed;
  right: 80px;
  bottom: 100px;
  width: 360px;
  border-radius: 8px;
  border: 1px solid var(--te-border-color-divider, rgba(232, 232, 232, 1));
  box-sizing: border-box;
  background: var(--te-bg-color-overlay, rgba(255, 255, 255, 1));
  box-shadow: 0px 6px 18px 6px rgba(0, 0, 0, 0.06),
    0px 4px 12px rgba(0, 0, 0, 0.08), 0px 2px 6px -3px rgba(0, 0, 0, 0.1);
  padding: 16px 16px 16px 24px;
  cursor: pointer;
  z-index: 2001;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &-level {
    flex-shrink: 0;
  }

  &-device {
    flex: 1;
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-time {
    color: var(--te-text-color-secondary, rgba(0, 0, 0, 0.55));
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
  }

  &-close {
    cursor: pointer;
    font-size: 18px;
    color: var(--te-text-color-secondary);
    line-height: 1;
    flex-shrink: 0;
  }

  &-object {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
    margin-bottom: var(--te-space-4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-content {
    color: var(--te-text-color-secondary, rgba(0, 0, 0, 0.55));
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .te-tag.te-tag--data6 {
    background-color: var(--te-color-data6-default);
  }

  /* 底部进度条：从左向右消失（origin: left, scaleX 1→0） */
  &-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    transform-origin: left center;
    animation: alarm-notification-progress var(--alarm-progress-duration, 5s)
      linear forwards;
  }
}

@keyframes alarm-notification-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.alarm-notification-enter-active,
.alarm-notification-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.alarm-notification-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.alarm-notification-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>
