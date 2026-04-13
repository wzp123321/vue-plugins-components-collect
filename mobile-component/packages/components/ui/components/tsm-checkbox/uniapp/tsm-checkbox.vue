/** * Checkbox 复选框组件 * @description 复选框组件，用于多选场景 */
<template>
  <view class="tsm-checkbox" :class="bemClass" :style="customStyle" @tap="clickHandler">
    <view class="tsm-checkbox__icon" :class="iconClass" :style="iconStyle">
      <icon-setting />
    </view>
    <text v-if="label" class="tsm-checkbox__label" :style="labelStyle" @tap.stop="labelClickHandler">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CheckboxProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<CheckboxProps>(), defaultProps);

const emit = defineEmits<{
  change: [checked: boolean];
  'update:checked': [value: boolean];
}>();

const isChecked = computed(() => props.checked);

const bemClass = computed(() => {
  return bem('checkbox', [props.disabled ? 'disabled' : ''], [], props.customClass);
});

const iconClass = computed(() => {
  return bem('checkbox__icon', [props.shape, isChecked.value ? 'checked' : '']);
});

const iconStyle = computed(() => {
  return {
    width: addUnit(String(props.size)),
    height: addUnit(String(props.size)),
    borderColor: isChecked.value ? props.activeColor : props.inactiveColor,
    backgroundColor: isChecked.value ? props.activeColor : 'transparent',
  };
});

const labelStyle = computed(() => {
  return {
    color: props.disabled ? props.inactiveColor : props.labelColor,
    fontSize: addUnit(String(props.labelSize)),
  };
});

const clickHandler = () => {
  if (props.disabled) return;
  const newValue = !isChecked.value;
  emit('update:checked', newValue);
  emit('change', newValue);
};

const labelClickHandler = () => {
  if (!props.disabled) {
    clickHandler();
  }
};
</script>

<style scoped lang="scss">
.tsm-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
  margin-top: 5px;
}

.tsm-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tsm-checkbox__icon {
  box-sizing: border-box;
  transition-property: border-color, background-color, color;
  transition-duration: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-color: #c8c9cc;
  margin-right: 6px;
}

.tsm-checkbox__icon--circle {
  border-radius: 100%;
}

.tsm-checkbox__icon--square {
  border-radius: 3px;
}

.tsm-checkbox__icon--checked {
  color: #ffffff;
}

.tsm-checkbox__label {
  word-wrap: break-word;
  margin-left: 5px;
  color: #606266;
  font-size: 15px;
}
</style>
