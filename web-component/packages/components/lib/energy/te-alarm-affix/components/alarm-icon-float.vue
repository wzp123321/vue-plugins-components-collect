<!--
 * 全局告警悬浮图标:Y 轴拖拽 + 等级图标/脉冲 + 24h 合并角标
 * 显隐 = systemCode ∈ appScope
-->
<template>
  <div
    v-if="visible"
    class="alarm-icon-float"
    :class="getFloatClass()"
    :style="getRootStyle()"
    @pointerdown="onPointerDown"
    @click="onClick"
  >
    <te-badge
      :value="badgeText"
      :max="99"
      :hidden="badgeText === ''"
      :type="badgeType"
    >
      <div class="aif-cover">
        <img :src="currentIcon" alt="alarm" draggable="false" />
      </div>
    </te-badge>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, watch } from 'vue';
import { TeBadge } from '@tiansu/element-plus';
import defaultIcon from '../assets/alarm-affix-none-icon.png';
import seriousIcon from '../assets/alarm-affix-serious-icon.png';
import normalIcon from '../assets/alarm-affix-normal-icon.png';
import infoIcon from '../assets/alarm-affix-info-icon.png';
import { AlarmLevel } from '../api/index.api';
import { formatBadge, getPulseColorRgbByLevel } from '../utils';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import { useDraggableIcon } from '../hooks';

defineOptions({
  name: 'TeAlarmIconFloat',
});

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    /** 业务系统传入,如 'IMS' */
    systemCode: string;
    /** 图标尺寸(宽高,px),默认 52 */
    size?: number;
    /** 图标 z-index,默认 2001 */
    zIndex?: number;
    /** 距视口右边缘距离(px),默认 20 */
    rightOffset?: number;
    /** 默认距视口底部的距离(px),默认 100 */
    defaultBottom?: number;
    /** 最小距视口底部的距离(px),默认 20,防贴底 */
    minBottom?: number;
  }>(),
  {
    size: 52,
    zIndex: 2001,
    rightOffset: 20,
    defaultBottom: 100,
    minBottom: 20,
  },
);

const emit = defineEmits<{
  (event: 'open'): void;
  /**
   * 开始拖拽:父级(alarmAffix)用于显示全屏透明遮罩,
   * 绕开 iframe 对 window 指针事件的吞噬
   */
  (event: 'drag-start'): void;
  /** 结束拖拽:父级隐藏遮罩 */
  (event: 'drag-end'): void;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmIconFloat] 必须在外层 <TeAlarmAffix> / 业务容器内使用,以注入 services',
  );
}

const badgeTotal = services.badgeTotal;

const { isSystemInScope } = services.config;

/* 显隐 */
const visible = computed(() => isSystemInScope(props.systemCode as never));

/* 图标 + 脉冲 */
/** 当前展示的告警等级(持久,脉冲停也保持) */
const currentLevel = computed(
  () => services.notification.latestAlarm.value?.levelCode ?? null,
);

/** 脉冲激活态:Toast dismiss / 30s 自动 / clearLatestAlarm 时停止 */
const isPulsing = computed(() => services.notification.pulseActive.value);

/** 图标按等级切换 */
const currentIcon = computed(() => {
  const level = currentLevel.value;
  if (!level) {
    return defaultIcon;
  }
  if (level === AlarmLevel.CRITICAL || level === AlarmLevel.MAJOR) {
    return seriousIcon;
  }
  if (level === AlarmLevel.MINOR) {
    return normalIcon;
  }
  if (level === AlarmLevel.INFO) {
    return infoIcon;
  }
  return defaultIcon;
});

/* ============ 角标 ============ */
/** 来自 services.badgeTotal(24h 窗口内告警+事件未确认合并总数) */
const total = computed(() => badgeTotal.value);

const badgeText = computed(() => {
  if (total.value <= 0) {
    return '0';
  }
  return formatBadge(total.value);
});

const badgeType = computed(() => {
  if (total.value <= 0) {
    return 'info';
  }
  return 'danger';
});

/* 模板上用的方法(不允许内联逻辑) */
const getFloatClass = (): Record<string, boolean> => ({
  'is-pulsing': isPulsing.value,
});

/* 拖拽(Y 轴,由 useDraggableIcon 接管;position.y 为"距视口底部"距离) */
const { position, onDragStart, isDragging, hasMoved } = useDraggableIcon({
  entrySize: props.size,
  defaultBottom: props.defaultBottom,
  minBottom: props.minBottom,
});

/**
 * 包装 hook 的 onDragStart:进入拖拽后通知父级显示 mask
 */
const onPointerDown = (event: PointerEvent) => {
  onDragStart(event);
  if (isDragging.value) {
    emit('drag-start');
  }
};

/** 拖拽结束(endDrag)时通知父级隐藏 mask */
watch(
  isDragging,
  (dragging) => {
    if (!dragging) {
      emit('drag-end');
    }
  },
  { flush: 'sync' },
);

/* 样式:动态值通过 :style 注入 */
const getRootStyle = (): Record<string, string> => {
  const level = currentLevel.value;
  return {
    bottom: `${position.value.y}px`,
    right: `${props.rightOffset}px`,
    width: `${props.size}px`,
    height: `${props.size}px`,
    zIndex: String(props.zIndex),
    '--pulse-rgb': level ? getPulseColorRgbByLevel(level) : '245, 34, 45',
  };
};

/* 点击 */
const onClick = (event: MouseEvent) => {
  if (hasMoved.value) {
    // 拖拽松手后浏览器会同步派发 click,消费掉 hasMoved 避免误打开主弹框
    hasMoved.value = false;
    event.stopPropagation();
    return;
  }
  event.stopPropagation();
  emit('open');
};
</script>

<style lang="less" scoped>
.alarm-icon-float {
  position: fixed;
  cursor: grab;
  user-select: none;
  touch-action: none;
  border-radius: 99px;
  background: var(--te-bg-color-overlay, rgba(255, 255, 255, 1));
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.06), 0px 0px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;

  .aif-cover {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 36px;
      height: 36px;
      object-fit: contain;
      /* 禁用浏览器原生图片拖拽,避免抢占 pointermove */
      -webkit-user-drag: none;
      user-drag: none;
      /* img 透明于指针事件,事件直接穿透到父 div */
      pointer-events: none;
    }
  }

  &.is-pulsing::before,
  &.is-pulsing::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 99px;
    pointer-events: none;
    box-shadow: 0 0 0 0 rgba(var(--pulse-rgb, 245, 34, 45), 0.55);
    animation: alarm-icon-pulse 2s ease-out infinite;
  }
  &.is-pulsing::after {
    animation-delay: 1s;
  }
}

@keyframes alarm-icon-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-rgb, 245, 34, 45), 0.55);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(var(--pulse-rgb, 245, 34, 45), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-rgb, 245, 34, 45), 0);
  }
}
</style>
