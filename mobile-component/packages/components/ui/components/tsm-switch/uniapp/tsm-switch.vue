/** * Switch 开关组件 * @description 开关组件，用于切换状态 */
<template>
  <view class="tsm-switch" :class="bemClass" :style="switchStyle" @tap="clickHandler">
    <view class="tsm-switch-node" :style="nodeStyle"></view>
    <view class="tsm-switch-text" :class="{ 'is-checked': isChecked }" v-if="props.inactiveText">
      {{ props.checked ? props.checkedText : props.unCheckedText }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SwitchProps } from './props';
import { defaultProps, SWITCH_PADDING as innerPadding, getSwitchSize, getNodeWidthBySize } from './props';
import { addStyle, addUnit, bem } from '../../../libs/uniapp/function/index';

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

const bemClass = computed(() => {
  return bem(
    'switch',
    [props.size],
    [
      ['disabled', props.disabled],
      ['checked', isChecked.value],
    ],
    props.customClass
  );
});

const switchStyle = computed(() => {
  const { width, height } = getSwitchSize(props.size);

  return addStyle({
    '--tsm-switch-node-size': addUnit(String(getNodeWidthBySize(props.size))),
    width: 'max-content',
    minWidth: addUnit(String(width)),
    height: addUnit(String(height)),
    backgroundColor: props.disabled
      ? 'var(--tsm-color-primary-border)'
      : isChecked.value
        ? props.activeColor
        : props.inactiveColor,
    ...props.customStyle,
  });
});

const nodeStyle = computed(() => {
  const nodeSize = getNodeWidthBySize(props.size);
  const left = isChecked.value ? `calc(100% - ${addUnit(String(nodeSize))} - 4px)` : addUnit(innerPadding);
  return {
    left,
    width: addUnit(String(nodeSize)),
    height: addUnit(String(nodeSize)),
  };
});

const clickHandler = () => {
  if (!props.disabled) {
    const newValue = !isChecked.value;
    emit('update:checked', newValue);
    emit('change', newValue);
  }
};
</script>

<style scoped lang="scss">
.tsm-switch {
  display: inline-flex;
  align-items: center;
  border-radius: 100px;
  transition: background-color 0.3s;
  position: relative;
  padding: var(--tsm-spacing-none) var(--tsm-spacing-xs);
  box-sizing: border-box;
  .tsm-switch-node {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: var(--tsm-color-bg-white);
    border-radius: 100%;
    transition: left 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .tsm-switch-text {
    padding-left: calc(var(--tsm-switch-node-size) + var(--tsm-spacing-xs));
    padding-right: var(--tsm-spacing-xs);
    color: var(--tsm-color-text-placeholder);
    white-space: nowrap;
  }

  .tsm-switch-text.is-checked {
    padding-left: var(--tsm-spacing-xs);
    padding-right: calc(var(--tsm-switch-node-size) + var(--tsm-spacing-xs));
    color: var(--tsm-color-bg-white);
  }

  &.tsm-switch--disabled {
    cursor: not-allowed;
    .tsm-switch-text {
      color: var(--tsm-color-text-placeholder);
    }
  }
  &.tsm-switch--large {
    .tsm-switch-text {
      text-align: center;

      font-family: 'PingFang SC';
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px; /* 150% */
    }
  }
  &.tsm-switch--medium {
    .tsm-switch-text {
      text-align: center;

      /* Basic/Regular/--tem-font-size-b14 */
      font-family: 'PingFang SC';
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px; /* 157.143% */
    }
  }
  &.tsm-switch--small {
    .tsm-switch-text {
      text-align: center;

      /* Basic/Regular/--tem-font-size-s12 */
      font-family: 'PingFang SC';
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px; /* 166.667% */
    }
  }
}
</style>
