/** * Badge 徽标组件 * @description 该组件一般用于图标右上角显示未读的消息数量，提示用户点击 */
<template>
  <view class="tsm-badge-wrapper">
    <slot />
    <text
      class="tsm-badge"
      :class="[bemClass, { 'tsm-badge--with-slot': hasDefaultSlot }]"
      :style="badgeStyle"
      v-if="show && ((Number(value) === 0 ? showZero : true) || isDot)"
      @tap="handleTap"
    >
      {{ isDot ? '' : showValue }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { BadgeProps } from './props';
import { BadgeNumberType, defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<BadgeProps>(), defaultProps);

// 对外抛出点击事件
const emit = defineEmits<{
  click: [];
}>();

const handleTap = () => {
  emit('click');
};

const slots = useSlots();

// 是否存在实际渲染内容的默认插槽，用于决定徽标是否需要相对插槽内容绝对定位
const hasDefaultSlot = computed(() => {
  const defaultSlot = slots.default;
  return Boolean(defaultSlot && defaultSlot().length);
});

// 生成 BEM 风格类名：主题、形状、尺寸 + 模式、是否为圆点
const bemClass = computed(() => {
  return bem(
    'badge',
    [props.theme || '', props.shape, props.size],
    [
      [props.mode, !props.isDot],
      ['dot', props.isDot],
      ['not-dot', !props.isDot],
    ],
    props.customClass
  );
});

const badgeStyle = computed(() => {
  const style: Record<string, any> = {};
  // 当包裹内容存在时，徽标相对于右上角做偏移，offset[0] 为水平偏移，offset[1] 为垂直偏移
  if (hasDefaultSlot.value) {
    const offsetX = props.offset?.[0] ?? 0;
    const offsetY = props.offset?.[1] ?? 0;
    const x = typeof offsetX === 'number' ? `${offsetX}px` : offsetX;
    const y = typeof offsetY === 'number' ? `${offsetY}px` : offsetY;
    style.left = `calc(100% + ${x})`;
    style.top = `calc(0px + ${y})`;
  }
  return { ...style, ...props.customStyle };
});

const showValue = computed(() => {
  if (Number.isNaN(Number(props.value))) {
    return props.value;
  }
  const value = Number(props.value);
  const max = Number(props.max);
  switch (props.numberType) {
    case BadgeNumberType.Overflow:
      return value > max ? `${max}+` : String(value);
    case BadgeNumberType.Ellipsis:
      return value > max ? '...' : String(value);
    case BadgeNumberType.Limit:
      if (value > 999) {
        if (value >= 9999) {
          return Math.floor((value / 1e4) * 100) / 100 + 'w';
        }
        return Math.floor((value / 1e3) * 100) / 100 + 'k';
      }
      return String(value);
    default:
      return String(value);
  }
});
</script>

<style scoped lang="scss">
.tsm-badge-wrapper {
  display: inline-flex;
  position: relative;
}

.tsm-badge {
  display: flex;
  box-sizing: border-box;
  background-color: var(--tsm-color-danger);
  color: var(--tsm-color-text-white);
  transform: var(--tsm-badge-transform, none);

  &.tsm-badge--with-slot {
    position: absolute;
    top: 0;
    left: 100%;
    --tsm-badge-transform: translate(-50%, -50%);
  }

  &.tsm-badge--dot {
    width: 6px;
    min-width: 6px;
    height: 6px;
    padding: 0;
    border-radius: 999px;

    &.tsm-badge--large {
      width: 10px;
      min-width: 10px;
      height: 10px;
    }
  }

  &.tsm-badge--not-dot {
    &.tsm-badge--circle {
      width: max-content;
      padding: 0 2px;
      min-width: 14px;
      height: 14px;
      border-radius: 100px;

      &.tsm-badge--medium {
        font-size: var(--tsm-font-size-text-2xs);
        font-style: normal;
        font-weight: var(--tsm-font-weight-bold);
        line-height: var(--tsm-line-height-text-2xs);
      }

      &.tsm-badge--large {
        width: 16px;
        min-width: 16px;
        height: 16px;
        text-align: center;
        font-size: var(--tsm-font-size-text-s);
        font-style: normal;
        font-weight: var(--tsm-font-weight-bold);
        line-height: var(--tsm-line-height-text-xs);
      }
    }
  }

  &.tsm-badge--ribbon-right {
    border-radius: 0;
    width: 45.25px;
    min-width: 45.25px;
    height: 16px;
    padding: 0;
    transform-origin: center;
    --tsm-badge-transform: rotate(45deg);
    clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 100%, 0 100%);
    font-size: var(--tsm-font-size-text-2xs);
    font-style: normal;
    font-weight: var(--tsm-font-weight-bold);
    line-height: var(--tsm-line-height-text-2xs);

    &.tsm-badge--large {
      width: 50.91px;
      min-width: 50.91px;
      height: 18px;
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-xs);
    }

    &.tsm-badge--with-slot {
      --tsm-badge-transform: translate(-50%, -50%) rotate(45deg);
    }
  }

  &.tsm-badge--ribbon-round {
    border-radius: var(--tsm-radius-none) var(--tsm-radius-none) var(--tsm-radius-none) var(--tsm-radius-s);
    width: max-content;
    padding: 0 6px;
    min-width: 32px;
    height: 16px;
    font-size: var(--tsm-font-size-text-2xs);
    font-style: normal;
    font-weight: var(--tsm-font-weight-bold);
    line-height: var(--tsm-line-height-text-2xs);

    &.tsm-badge--large {
      min-width: 40px;
      height: 18px;
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-xs);
    }
  }

  &.tsm-badge--bubble {
    border-radius: var(--tsm-radius-m) var(--tsm-radius-l) var(--tsm-radius-l) var(--tsm-radius-none);
    width: max-content;
    padding: 0 4px;
    min-width: 32px;
    height: 16px;
    font-size: var(--tsm-font-size-text-2xs);
    font-style: normal;
    font-weight: var(--tsm-font-weight-bold);
    line-height: var(--tsm-line-height-text-2xs);

    &.tsm-badge--large {
      min-width: 40px;
      height: 18px;
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-xs);
    }
  }

  &.tsm-badge--circle,
  &.tsm-badge--ribbon-right,
  &.tsm-badge--ribbon-round,
  &.tsm-badge--bubble {
    justify-content: center;
    align-items: center;
  }

  &.tsm-badge--light {
    background-color: var(--tsm-color-danger-bg);
    color: var(--tsm-color-danger-active);
  }

  &.tsm-badge--warning {
    background-color: var(--tsm-color-warning);
    color: var(--tsm-color-text-white);

    &.tsm-badge--light {
      background-color: var(--tsm-color-warning-bg);
      color: var(--tsm-color-warning);
    }
  }

  &.tsm-badge--primary {
    background-color: var(--tsm-color-primary);
    color: var(--tsm-color-text-white);

    &.tsm-badge--light {
      background-color: var(--tsm-color-primary-bg);
      color: var(--tsm-color-primary);
    }
  }

  &.tsm-badge--success {
    background-color: var(--tsm-color-success);
    color: var(--tsm-color-text-white);

    &.tsm-badge--light {
      background-color: var(--tsm-color-success-bg);
      color: var(--tsm-color-success);

      &.tsm-badge--large {
        color: var(--tsm-color-success-active);
      }
    }
  }

  &.tsm-badge--info {
    background-color: var(--tsm-color-text-quaternary);
    color: var(--tsm-color-text-white);

    &.tsm-badge--light {
      background-color: var(--tsm-color-bg-secondary);
      color: var(--tsm-color-text-secondary);
    }
  }
}
</style>
