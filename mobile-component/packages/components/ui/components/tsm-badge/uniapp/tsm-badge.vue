/** * Badge 徽标组件 * @description 该组件一般用于图标右上角显示未读的消息数量，提示用户点击 */
<template>
  <view class="tsm-badge-wrapper">
    <!-- 插槽：default - 被徽标标记的主体内容（通常是图标或按钮） -->
    <slot></slot>
    <view
      class="tsm-badge"
      :class="[bemClass]"
      :style="badgeStyle"
      v-if="show && ((Number(value) === 0 ? showZero : true) || isDot)"
      @tap="handleTap"
    >
      <img v-if="shape === 'ribbon-right'" class="tsm-badge__bg-image" :src="ribbonBgImage" mode="scaleToFill" />
      <text class="tsm-badge-text" :class="{ 'tsm-badge__content--ribbon-right': shape === 'ribbon-right' }">
        {{ isDot ? '' : showValue }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { type BadgeProps, BadgeNumberType, defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

import PicBadgeM from '../../../assets/image/badge/pic-badge-m.svg';
import PicBadgeL from '../../../assets/image/badge/pic-badge-l.svg';
import PicBadgeLightM from '../../../assets/image/badge/pic-badge-light-m.svg';
import PicBadgeLightL from '../../../assets/image/badge/pic-badge-light-l.svg';
import PicBadgePrimaryM from '../../../assets/image/badge/pic-badge-primary-m.svg';
import PicBadgePrimaryL from '../../../assets/image/badge/pic-badge-primary-l.svg';
import PicBadgePrimaryLightM from '../../../assets/image/badge/pic-badge-primary-light-m.svg';
import PicBadgePrimaryLightL from '../../../assets/image/badge/pic-badge-primary-light-l.svg';
import PicBadgeSuccessM from '../../../assets/image/badge/pic-badge-success-m.svg';
import PicBadgeSuccessL from '../../../assets/image/badge/pic-badge-success-l.svg';
import PicBadgeSuccessLightM from '../../../assets/image/badge/pic-badge-success-light-m.svg';
import PicBadgeSuccessLightL from '../../../assets/image/badge/pic-badge-success-light-l.svg';
import PicBadgeWarningM from '../../../assets/image/badge/pic-badge-warning-m.svg';
import PicBadgeWarningL from '../../../assets/image/badge/pic-badge-warning-l.svg';
import PicBadgeWarningLightM from '../../../assets/image/badge/pic-badge-warning-light-m.svg';
import PicBadgeWarningLightL from '../../../assets/image/badge/pic-badge-warning-light-l.svg';
import PicBadgeInfoM from '../../../assets/image/badge/pic-badge-info-m.svg';
import PicBadgeInfoL from '../../../assets/image/badge/pic-badge-info-l.svg';
import PicBadgeInfoLightM from '../../../assets/image/badge/pic-badge-info-light-m.svg';
import PicBadgeInfoLightL from '../../../assets/image/badge/pic-badge-info-light-l.svg';

const slots = useSlots();

const props = withDefaults(defineProps<BadgeProps>(), defaultProps);

const emit = defineEmits<{
  /** 点击徽标 */
  click: [];
}>();

const handleTap = () => {
  emit('click');
};

const ribbonBgImage = computed(() => {
  const isLarge = props.size === 'large';
  const isLight = props.theme === 'light';
  const mode = props.mode ?? 'error';

  const imageMap: Record<string, string> = {
    error: isLarge ? (isLight ? PicBadgeLightL : PicBadgeL) : isLight ? PicBadgeLightM : PicBadgeM,
    primary: isLarge
      ? isLight
        ? PicBadgePrimaryLightL
        : PicBadgePrimaryL
      : isLight
        ? PicBadgePrimaryLightM
        : PicBadgePrimaryM,
    success: isLarge
      ? isLight
        ? PicBadgeSuccessLightL
        : PicBadgeSuccessL
      : isLight
        ? PicBadgeSuccessLightM
        : PicBadgeSuccessM,
    warning: isLarge
      ? isLight
        ? PicBadgeWarningLightL
        : PicBadgeWarningL
      : isLight
        ? PicBadgeWarningLightM
        : PicBadgeWarningM,
    info: isLarge ? (isLight ? PicBadgeInfoLightL : PicBadgeInfoL) : isLight ? PicBadgeInfoLightM : PicBadgeInfoM,
  };
  return imageMap[mode] ?? imageMap.error;
});

const hasSlot = computed(() => !!slots?.default);

const hasWhiteBorder = computed(() => {
  return props.isDot || (!props.isDot && props.shape === 'circle' && props.theme !== 'light');
});

const bemClass = computed(() => {
  return bem(
    'badge',
    [props.mode || 'primary', props.shape, props.size],
    [
      [props.theme, !props.isDot],
      ['dot', props.isDot],
      ['not-dot', !props.isDot],
      ['absolute', hasSlot.value],
      ['border-white', hasWhiteBorder.value],
    ]
  );
});

const badgeStyle = computed(() => {
  const style: Record<string, any> = {};
  if (props.absolute) {
    style.position = 'absolute';
    const offsetX = props.offset?.[0] ?? 0;
    const offsetY = props.offset?.[1] ?? 0;
    style.top = typeof offsetY === 'number' ? `${offsetY}px` : offsetY;
    style.right = typeof offsetX === 'number' ? `${offsetX}px` : offsetX;
  }
  return style;
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
  position: relative;
  display: flex;
}

.tsm-badge {
  display: flex;
  box-sizing: border-box;
}

.tsm-badge.tsm-badge--absolute {
  position: absolute;
  top: 0px;
  right: 0px;
}

.tsm-badge--dot {
  width: 6px;
  min-width: 6px;
  height: 6px;
  padding: 0;
  border-radius: 999px;
}

.tsm-badge--dot.tsm-badge--large {
  width: 10px;
  min-width: 10px;
  height: 10px;
}

.tsm-badge--not-dot.tsm-badge--circle {
  padding: 0 2px;
  min-width: 14px;
  height: 14px;
  border-radius: 100px;
}

.tsm-badge--dot.tsm-badge--border-white,
.tsm-badge--not-dot.tsm-badge--circle.tsm-badge--border-white {
  box-shadow: 0 0 0 1px #ffffff;
}

.tsm-badge--not-dot .tsm-badge-text {
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-badge--not-dot.tsm-badge--circle.tsm-badge--medium {
  font-size: var(--tsm-font-size-text-2xs);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-2xs);
}

.tsm-badge--not-dot.tsm-badge--circle.tsm-badge--large {
  min-width: 16px;
  height: 16px;
  text-align: center;
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xs);
}

.tsm-badge--ribbon-right {
  position: relative;
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 0;
  background-color: transparent !important;
  font-size: var(--tsm-font-size-text-2xs);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-2xs);
}

.tsm-badge--ribbon-right.tsm-badge--large {
  width: 36px;
  min-width: 36px;
  height: 36px;
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xs);
}

.tsm-badge__bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.tsm-badge__content--ribbon-right {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg) translate(0px, -7px);
}

.tsm-badge--ribbon-round {
  border-radius: var(--tsm-radius-none) var(--tsm-radius-none) var(--tsm-radius-none) var(--tsm-radius-s);
  padding: 0 6px;
  min-width: 32px;
  height: 16px;
  font-size: var(--tsm-font-size-text-2xs);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-2xs);
}

.tsm-badge--ribbon-round.tsm-badge--large {
  min-width: 40px;
  height: 18px;
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xs);
}

.tsm-badge--bubble {
  border-radius: var(--tsm-radius-m) var(--tsm-radius-l) var(--tsm-radius-l) var(--tsm-radius-none);
  padding: 0 4px;
  min-width: 32px;
  height: 16px;
  font-size: var(--tsm-font-size-text-2xs);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-2xs);
}

.tsm-badge--bubble.tsm-badge--large {
  min-width: 40px;
  height: 18px;
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xs);
}

.tsm-badge--circle,
.tsm-badge--ribbon-right,
.tsm-badge--ribbon-round,
.tsm-badge--bubble {
  justify-content: center;
  align-items: center;
}

.tsm-badge--error {
  background-color: var(--tsm-color-danger);
  color: var(--tsm-color-text-white);
}

.tsm-badge--error.tsm-badge--light {
  background-color: var(--tsm-color-danger-bg);
  color: var(--tsm-color-danger);
}

.tsm-badge--warning {
  background-color: var(--tsm-color-warning);
  color: var(--tsm-color-text-white);
}

.tsm-badge--warning.tsm-badge--light {
  background-color: var(--tsm-color-warning-bg);
  color: var(--tsm-color-warning);
}

.tsm-badge--primary {
  background-color: var(--tsm-color-primary);
  color: var(--tsm-color-text-white);
}

.tsm-badge--primary.tsm-badge--light {
  background-color: var(--tsm-color-primary-bg);
  color: var(--tsm-color-primary);
}

.tsm-badge--success {
  background-color: var(--tsm-color-success);
  color: var(--tsm-color-text-white);
}

.tsm-badge--success.tsm-badge--light {
  background-color: var(--tsm-color-success-bg);
  color: var(--tsm-color-success);
}

.tsm-badge--success.tsm-badge--light.tsm-badge--large {
  color: var(--tsm-color-success);
}

.tsm-badge--info {
  background-color: var(--tsm-color-text-quaternary);
  color: var(--tsm-color-text-white);
}

.tsm-badge--info.tsm-badge--light {
  background-color: var(--tsm-color-bg-secondary);
  color: var(--tsm-color-text-secondary);
}
</style>
