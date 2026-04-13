/** * Switch 开关组件 * @description 开关组件，用于切换状态 */
<template>
  <view
    class="tsm-switch"
    :class="[customClass, { 'tsm-switch--checked': isChecked, 'tsm-switch--disabled': disabled }]"
    :style="switchStyle"
    @tap="clickHandler"
  >
    <view class="tsm-switch__node" :style="nodeStyle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SwitchProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle } from '../../../libs/uniapp/function/index';

/**
 * Switch 组件 Props
 * @property {boolean} checked - 是否选中
 * @property {boolean} disabled - 是否禁用
 * @property {string} activeColor - 选中时的颜色
 * @property {string} inactiveColor - 未选中时的颜色
 * @property {number|string} size - 开关大小
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<SwitchProps>(), defaultProps);

const emit = defineEmits<{
  change: [checked: boolean];
  'update:checked': [value: boolean];
}>();

const isChecked = computed(() => props.checked);

const switchStyle = computed(() => {
  const size = addUnit(String(props.size));
  return addStyle({
    width: size,
    height: addUnit(String(Number(props.size) * 0.6)),
    backgroundColor: isChecked.value ? props.activeColor : props.inactiveColor,
    ...props.customStyle,
  });
});

const nodeStyle = computed(() => {
  const nodeSize = Number(props.size) * 0.5;
  const padding = 2;
  const translateX = isChecked.value ? Number(props.size) - nodeSize - padding : padding;
  return {
    width: addUnit(String(nodeSize)),
    height: addUnit(String(nodeSize)),
    transform: `translateX(${translateX}px)`,
  };
});

const clickHandler = () => {
  if (props.disabled) return;
  const newValue = !isChecked.value;
  emit('update:checked', newValue);
  emit('change', newValue);
};
</script>

<style scoped lang="scss">
.tsm-switch {
  display: flex;
  align-items: center;
  border-radius: 100px;
  transition: background-color 0.3s;
  position: relative;
  cursor: pointer;
}

.tsm-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tsm-switch__node {
  background-color: #ffffff;
  border-radius: 100%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
