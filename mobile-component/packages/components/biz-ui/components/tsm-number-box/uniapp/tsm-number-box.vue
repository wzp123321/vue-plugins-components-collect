/** * NumberBox 数字输入框组件 * @description 数字输入框组件，用于增减数字 */
<template>
  <view class="tsm-number-box" :class="bemClass" :style="customStyle">
    <view
      class="tsm-number-box__button"
      :class="{ 'tsm-number-box__button--disabled': currentValue <= min }"
      @tap="onMinus"
    >
      <text>-</text>
    </view>
    <input
      class="tsm-number-box__input"
      type="number"
      :value="currentValue"
      :disabled="disabled"
      @input="onInput"
      @blur="onBlur"
    />
    <view
      class="tsm-number-box__button"
      :class="{ 'tsm-number-box__button--disabled': currentValue >= max }"
      @tap="onPlus"
    >
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { NumberBoxProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<NumberBoxProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: number];
  'update:value': [value: number];
}>();

const currentValue = ref(props.value);

watch(
  () => props.value,
  newVal => {
    currentValue.value = newVal;
  }
);

const bemClass = computed(() => {
  return bem('number-box', [props.disabled ? 'disabled' : ''], [], props.customClass);
});

const onMinus = () => {
  if (currentValue.value > props.min) {
    currentValue.value = Math.max(props.min, currentValue.value - props.step);
    emit('update:value', currentValue.value);
    emit('change', currentValue.value);
  }
};

const onPlus = () => {
  if (currentValue.value < props.max) {
    currentValue.value = Math.min(props.max, currentValue.value + props.step);
    emit('update:value', currentValue.value);
    emit('change', currentValue.value);
  }
};

const onInput = (e: any) => {
  let value = parseInt(e.detail.value) || 0;
  value = Math.max(props.min, Math.min(props.max, value));
  currentValue.value = value;
  emit('update:value', value);
  emit('change', value);
};

const onBlur = (e: any) => {
  let value = parseInt(e.detail.value) || 0;
  value = Math.max(props.min, Math.min(props.max, value));
  currentValue.value = value;
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped lang="scss">
.tsm-number-box {
  display: flex;
  align-items: center;
}

.tsm-number-box--disabled {
  opacity: 0.5;
}

.tsm-number-box__button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 16px;
  color: #303133;
}

.tsm-number-box__button--disabled {
  color: #c8c9cc;
  background-color: #f2f3f5;
}

.tsm-number-box__input {
  width: 40px;
  height: 28px;
  text-align: center;
  border: 1px solid #ebedf0;
  border-left: none;
  border-right: none;
  font-size: 14px;
  color: #303133;
}
</style>
