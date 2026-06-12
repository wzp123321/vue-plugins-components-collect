/** * Progress 进度条组件 * @description 进度条组件，用于显示进度 */
<template>
  <view class="tsm-progress" :class="bemClass" :style="customStyle">
    <template v-if="type === 'line'">
      <view class="tsm-progress-line" :class="{ 'tsm-progress-line--inside': textInside && showText }">
        <view class="tsm-progress-line-fill" :style="{ width: `${percentage}%` }">
          <view v-if="textInside && showText" class="tsm-progress-line-text-inside">
            {{ displayText }}
          </view>
        </view>
      </view>
      <view v-if="!textInside && showText" class="tsm-progress-text">
        {{ displayText }}
      </view>
    </template>
    <template v-else>
      <!-- 圆形进度条实现 -->
      <view class="tsm-progress-circle">
        <svg class="tsm-progress-circle-svg" viewBox="0 0 100 100">
          <!-- 背景圆环 -->
          <circle
            class="tsm-progress-circle-bg"
            cx="50"
            cy="50"
            r="45"
            stroke="var(--tsm-color-bg-secondary)"
            stroke-width="4"
            fill="transparent"
          />
          <!-- 进度圆环 -->
          <circle
            class="tsm-progress-circle-fill"
            cx="50"
            cy="50"
            r="45"
            stroke-width="4"
            fill="transparent"
            :style="circleStyle"
          />
        </svg>
        <view v-if="showText" class="tsm-progress-circle-text">
          {{ displayText }}
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProgressProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<ProgressProps>(), defaultProps);

// 计算实际显示的百分比，确保在0-100之间
const percentage = computed(() => {
  return Math.max(0, Math.min(100, props.percentage));
});

// 计算显示文本
const displayText = computed(() => {
  if (props.formatText) {
    return props.formatText(percentage.value);
  }
  return `${percentage.value}%`;
});

// 计算BEM类名
const bemClass = computed(() => {
  return bem('progress', [props.type, props.status], [], props.customClass);
});

// 计算圆形进度条样式
const circleStyle = computed(() => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage.value / 100) * circumference;

  return {
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: offset,
    transform: 'rotate(-90deg)',
    transformOrigin: 'center center',
  };
});
</script>

<style scoped lang="scss">
.tsm-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tsm-spacing-m);
  width: 100%;
}
/** 进度条线样式 */
.tsm-progress--line {
  .tsm-progress-line {
    flex: 1 1 0;
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--tsm-color-bg-secondary);
  }
  .tsm-progress-line--inside {
    height: 16px;
    border-radius: 8px;
    .tsm-progress-line-fill {
      border-radius: 8px;
      .tsm-progress-line-text-inside {
        position: absolute;
        right: 8px;
        color: var(--tsm-color-text-white);
        font-size: var(--tsm-font-size-text-s);
        font-weight: var(--tsm-font-weight-regular);
        font-family: var(--tsm-font-family-regular);
      }
    }
  }
  .tsm-progress-line-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .tsm-progress-text {
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-m);
    font-weight: var(--tsm-font-weight-regular);
    color: var(--tsm-color-text-primary);
  }
}
/** 进度条圆形样式 */
.tsm-progress--circle {
  position: relative;
  min-width: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .tsm-progress-circle-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .tsm-progress-circle-fill {
    stroke-linecap: round;
    transition: stroke-dashoffset 0.3s ease;
  }

  .tsm-progress-circle-text {
    position: relative;
    z-index: 1;
    font-size: var(--tsm-font-size-text-m);
    font-weight: var(--tsm-font-weight-bold);
    color: var(--tsm-color-text-primary);
  }
}

/* 状态颜色 */
.tsm-progress--success {
  .tsm-progress-line-fill {
    background-color: var(--tsm-color-success);
  }
  .tsm-progress-circle-fill {
    stroke: var(--tsm-color-success);
  }
}
.tsm-progress--error {
  .tsm-progress-line-fill {
    background-color: var(--tsm-color-danger);
  }
  .tsm-progress-circle-fill {
    stroke: var(--tsm-color-danger);
  }
}
.tsm-progress--warning {
  .tsm-progress-line-fill {
    background-color: var(--tsm-color-warning);
  }
  .tsm-progress-circle-fill {
    stroke: var(--tsm-color-warning);
  }
}
.tsm-progress--info {
  .tsm-progress-line-fill {
    background-color: var(--tsm-color-primary);
  }
  .tsm-progress-circle-fill {
    stroke: var(--tsm-color-primary);
  }
}
</style>
