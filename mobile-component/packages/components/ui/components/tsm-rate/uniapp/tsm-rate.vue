<template>
  <view class="tsm-rate" :class="[customClass]" :style="customStyle">
    <view class="tsm-rate__stars">
      <view v-for="i in 5" :key="i" class="tsm-rate__star" @tap="onSelect(i)">
        <icon-star-fill :size="22" :color="inactiveColor" />
        <view class="tsm-rate__star-overlay" :style="{ width: getOverlayWidth(i) }">
          <icon-star-fill :size="22" :color="activeColor" />
        </view>
      </view>
    </view>
    <text class="tsm-rate__score" :class="{ 'tsm-rate__score--zero': displayValue === '0.0' }">{{ displayValue }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RateProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<RateProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: number];
  'update:value': [value: number];
}>();

const inactiveColor = 'rgba(213, 215, 218, 1)';
const activeColor = 'rgba(247, 144, 9, 1)';

const clampedValue = computed(() => Math.max(0, Math.min(5, props.value)));

const displayValue = computed(() => clampedValue.value.toFixed(1));

const getOverlayWidth = (i: number) => {
  const v = clampedValue.value;
  if (i <= Math.floor(v)) return '100%';
  if (i > Math.ceil(v)) return '0%';
  const fraction = v - Math.floor(v);
  const contentRatio = 18.9 / 22;
  const paddingRatio = (1 - contentRatio) / 2;
  const ratio = Math.round((fraction * contentRatio + paddingRatio) * 100);
  return `${ratio}%`;
};

const onSelect = (value: number) => {
  if (props.disabled) return;
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped lang="scss">
.tsm-rate {
  display: flex;
  align-items: center;
}

.tsm-rate__stars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tsm-rate__star {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.tsm-rate__star-overlay {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.tsm-rate__score {
  margin-left: 8px;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-l, 16px);
  line-height: var(--var-tsm-line-height-text-l, 24px);
}

.tsm-rate__score--zero {
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
}
</style>
