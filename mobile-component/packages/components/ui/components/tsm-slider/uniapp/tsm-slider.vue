/** * Slider 滑块组件 * @description 滑块组件，用于选择数值范围 */
<template>
  <view
    class="tsm-slider"
    :class="[customClass, { 'tsm-slider--disabled': disabled }]"
    :style="sliderStyle"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
  >
    <view class="tsm-slider__track">
      <view class="tsm-slider__track__active" :style="activeStyle"></view>
    </view>
    <view
      class="tsm-slider__block"
      :style="blockStyle"
      @touchstart.stop="touchStart"
      @touchmove.stop="touchMove"
      @touchend.stop="touchEnd"
    ></view>
    <text v-if="showValue" class="tsm-slider__value">{{ currentValue }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SliderProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle } from '../../../libs/uniapp/function/index';

/**
 * Slider 组件 Props
 * @property {number} value - 当前值
 * @property {number} min - 最小值
 * @property {number} max - 最大值
 * @property {number} step - 步长
 * @property {boolean} disabled - 是否禁用
 * @property {number} blockSize - 滑块大小
 * @property {string} activeColor - 滑块颜色
 * @property {string} inactiveColor - 背景颜色
 * @property {string} blockColor - 进度条颜色
 * @property {boolean} showValue - 是否显示当前值
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<SliderProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: number];
  input: [value: number];
  'update:value': [value: number];
}>();

const currentValue = ref(props.value);
const sliderRect = ref<any>(null);

watch(
  () => props.value,
  newVal => {
    currentValue.value = newVal;
  }
);

const sliderStyle = computed(() => {
  return addStyle(props.customStyle || {});
});

const percentage = computed(() => {
  return ((currentValue.value - props.min) / (props.max - props.min)) * 100;
});

const activeStyle = computed(() => {
  return {
    width: `${percentage.value}%`,
    backgroundColor: props.activeColor,
  };
});

const blockStyle = computed(() => {
  return {
    width: addUnit(String(props.blockSize)),
    height: addUnit(String(props.blockSize)),
    backgroundColor: props.blockColor,
    left: `calc(${percentage.value}% - ${props.blockSize / 2}px)`,
  };
});

const updateValue = (touchX: number) => {
  if (!sliderRect.value) return;
  const { left, width } = sliderRect.value;
  const percent = Math.max(0, Math.min(1, (touchX - left) / width));
  let value = props.min + percent * (props.max - props.min);
  value = Math.round(value / props.step) * props.step;
  value = Math.max(props.min, Math.min(props.max, value));
  currentValue.value = value;
  emit('update:value', value);
  emit('input', value);
  emit('change', value);
};

const touchStart = (e: any) => {
  if (props.disabled) return;
  const query = uni.createSelectorQuery();
  query
    .select('.tsm-slider')
    .boundingClientRect((rect: any) => {
      sliderRect.value = rect;
      updateValue(e.touches[0].clientX);
    })
    .exec();
};

const touchMove = (e: any) => {
  if (props.disabled) return;
  if (sliderRect.value) {
    updateValue(e.touches[0].clientX);
  }
};

const touchEnd = () => {
  // 滑动结束
};
</script>

<style scoped lang="scss">
.tsm-slider {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 30px;
}

.tsm-slider--disabled {
  opacity: 0.5;
}

.tsm-slider__track {
  width: 100%;
  height: 4px;
  background-color: #ebedf0;
  border-radius: 2px;
  position: relative;
}

.tsm-slider__track__active {
  height: 100%;
  border-radius: 2px;
  position: absolute;
  left: 0;
  top: 0;
}

.tsm-slider__block {
  position: absolute;
  border-radius: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  top: 50%;
  transform: translateY(-50%);
}

.tsm-slider__value {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
  min-width: 30px;
  text-align: center;
}
</style>
