/** * Radio 单选框组件 * @description 单选框组件，用于单选场景 */
<template>
  <view
    class="tsm-radio"
    :class="[customClass, { 'tsm-radio--disabled': disabled }]"
    :style="radioStyleObj"
    @tap="clickHandler"
  >
    <view
      class="tsm-radio__icon"
      :class="[`tsm-radio__icon--${shape}`, { 'tsm-radio__icon--checked': isChecked }]"
      :style="iconStyle"
    >
      <view v-if="isChecked" class="tsm-radio__icon__dot" :style="{ backgroundColor: iconColor }"></view>
    </view>
    <text v-if="label" class="tsm-radio__label" :style="labelStyleObj" @tap.stop="labelClickHandler">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { RadioProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle } from '../../../libs/uniapp/function/index';

/**
 * Radio 组件 Props
 * @property {string|number} name - 单选框的名称/标识
 * @property {boolean} checked - 是否选中
 * @property {boolean} disabled - 是否禁用
 * @property {string} shape - 单选框形状 (circle | square)
 * @property {string} activeColor - 选中时的颜色
 * @property {string} inactiveColor - 未选中时的颜色
 * @property {number|string} size - 单选框大小
 * @property {number|string} iconSize - 图标大小
 * @property {string} iconColor - 图标颜色
 * @property {string} label - 标签文字
 * @property {string} labelColor - 标签文字颜色
 * @property {number|string} labelSize - 标签文字大小
 * @property {boolean} labelDisabled - 是否禁用标签点击
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<RadioProps>(), defaultProps);

const emit = defineEmits<{
  change: [checked: boolean];
  'update:checked': [value: boolean];
}>();

const radioGroup = inject('radioGroup', null);

const isChecked = computed(() => {
  if (radioGroup && radioGroup.props) {
    return radioGroup.props.modelValue === props.name;
  }
  return props.checked;
});

const radioStyleObj = computed(() => {
  return addStyle(props.customStyle || {});
});

const iconStyle = computed(() => {
  return {
    width: addUnit(String(props.size)),
    height: addUnit(String(props.size)),
    borderColor: isChecked.value ? props.activeColor : props.inactiveColor,
  };
});

const labelStyleObj = computed(() => {
  return {
    color: props.disabled ? props.inactiveColor : props.labelColor,
    fontSize: addUnit(String(props.labelSize)),
  };
});

const clickHandler = () => {
  if (props.disabled) return;
  if (radioGroup && radioGroup.updateValue) {
    radioGroup.updateValue(props.name);
  } else {
    emit('update:checked', true);
    emit('change', true);
  }
};

const labelClickHandler = () => {
  if (!props.disabled) {
    clickHandler();
  }
};
</script>

<style scoped lang="scss">
.tsm-radio {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
  margin-top: 5px;
}

.tsm-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tsm-radio__icon {
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
  position: relative;
}

.tsm-radio__icon--circle {
  border-radius: 100%;
}

.tsm-radio__icon--square {
  border-radius: 3px;
}

.tsm-radio__icon--checked {
  border-color: #2979ff;
}

.tsm-radio__icon__dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background-color: #ffffff;
}

.tsm-radio__label {
  word-wrap: break-word;
  margin-left: 5px;
  color: #606266;
  font-size: 15px;
}
</style>
