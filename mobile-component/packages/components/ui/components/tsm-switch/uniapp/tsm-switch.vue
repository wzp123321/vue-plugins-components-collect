/** * Switch 开关组件 * @description 开关组件，用于切换状态 */
<template>
  <tsm-tag v-if="isReadonly" type="info" :text="readonlyText" />
  <view v-else class="tsm-switch" :class="bemClass" :style="switchStyle" @tap="handleSwitchChange">
    <view class="tsm-switch-node" :style="nodeStyle"></view>
    <view class="tsm-switch-text" :class="{ 'is-checked': isChecked }" v-if="props.inactiveText">
      {{ isChecked ? props.checkedText : props.unCheckedText }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, watch } from 'vue';
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

/**
 * 事件约定：
 * - update:checked：用于 v-model:checked 双向绑定
 * - change：用于业务侧监听值变化
 * 两者都输出 SwitchValue（boolean|string|number），与 active/inactiveValue 语义一致。
 */
const emit = defineEmits<{
  /** 开关状态变化时触发 */
  change: [checked: boolean | string | number];
  /** 更新开关状态 */
  'update:checked': [value: boolean | string | number];
}>();

// Inject FormItem 上下文（默认 null，独立使用时正常） 等formitem代码提交再改成FormItemContext
const formItemContext = inject<any | null>('formItemContext', null);

/**
 * 当前是否处于“选中态”：
 * 不是用布尔强转判断，而是与 activeValue 做严格相等比较，
 * 以支持 checked 为 number/string 等扩展值类型。
 */
const isChecked = computed(() => props.checked === props.activeValue);

const isReadonly = computed(() => props.readonly || formItemContext?.readonly);

const readonlyText = computed(() => {
  return isChecked.value ? props.checkedText : props.unCheckedText;
});

/**
 * BEM 类名计算：
 * - size 参与修饰符（large/medium/small）
 * - disabled / checked 参与状态修饰符
 */
const bemClass = computed(() => {
  return bem(
    'switch',
    [props.size],
    [
      ['disabled', props.disabled],
      ['checked', isChecked.value],
      ['readonly', isReadonly.value],
    ]
  );
});

/**
 * 尺寸元数据（统一计算，避免重复调用）：
 * - 原始数值：width/height/nodeSize
 * - 带单位字符串：widthUnit/heightUnit/nodeSizeUnit/paddingUnit
 * 这些值会被样式与 node 定位复用。
 */
const sizeMetrics = computed(() => {
  const { width, height } = getSwitchSize(props.size);
  const nodeSize = getNodeWidthBySize(props.size);
  return {
    width,
    height,
    nodeSize,
    widthUnit: addUnit(String(width)),
    heightUnit: addUnit(String(height)),
    nodeSizeUnit: addUnit(String(nodeSize)),
    paddingUnit: addUnit(String(innerPadding)),
  };
});

/**
 * 容器样式：
 * - 通过 CSS 变量暴露 node 尺寸，供文本 padding 计算使用
 * - 无文字时使用固定宽度；有文字时使用 max-content 自适应扩展
 * - minWidth 始终保底（large:56 / medium:48 / small:40）
 * - 颜色根据 disabled 与选中态动态切换
 */
const switchStyle = computed(() => {
  const { widthUnit, heightUnit, nodeSizeUnit } = sizeMetrics.value;

  return addStyle({
    '--tsm-switch-node-size': nodeSizeUnit,
    width: props.inactiveText ? 'max-content' : widthUnit,
    minWidth: widthUnit,
    height: heightUnit,
    backgroundColor: props.disabled
      ? 'var(--tsm-color-primary-border)'
      : isChecked.value
        ? props.activeColor
        : props.inactiveColor,
  });
});

/**
 * node（圆点）定位样式：
 * - 使用 position:absolute + left，避免 transform 水平位移在不同端表现差异
 * - 未选中：left = 内边距
 * - 选中：left = 容器总宽度 - node宽度 - 内边距
 */
const nodeStyle = computed(() => {
  const { nodeSizeUnit, paddingUnit } = sizeMetrics.value;
  const left = isChecked.value ? `calc(100% - ${nodeSizeUnit} - ${paddingUnit})` : paddingUnit;
  return {
    left,
    width: nodeSizeUnit,
    height: nodeSizeUnit,
  };
});

/**
 * 入参一致性校验：
 * checked 必须等于 activeValue 或 inactiveValue 之一。
 * 若不满足，会给出明确错误提示，方便快速定位传参问题。
 */
const validateCheckedValue = () => {
  const isValid = props.checked === props.activeValue || props.checked === props.inactiveValue;
  if (!isValid) {
    console.error(
      `[tsm-switch] Invalid "checked" value: ${String(props.checked)}. ` +
        `It must be equal to either activeValue (${String(props.activeValue)}) ` +
        `or inactiveValue (${String(props.inactiveValue)}).`
    );
  }
};

// 初始化即校验，并在相关值变化时持续校验。
watch(() => [props.checked, props.activeValue, props.inactiveValue], validateCheckedValue, { immediate: true });

/**
 * 交互切换逻辑：
 * - 当前为选中态 -> 切到 inactiveValue
 * - 当前为未选中态 -> 切到 activeValue
 * 然后同步触发 v-model 更新与 change 事件。
 */
const handleSwitchChange = () => {
  if (!props.disabled && !isReadonly.value) {
    const newValue = isChecked.value ? props.inactiveValue : props.activeValue;
    emit('update:checked', newValue);
    emit('change', newValue);
    formItemContext?.onValueChange(newValue);
  }
};
</script>

<style scoped lang="scss">
.tsm-switch {
  display: flex;
  align-items: center;
  border-radius: 100px;
  transition: background-color 0.3s;
  position: relative;
  padding: var(--tsm-spacing-none) var(--tsm-spacing-xs);
  box-sizing: border-box;
}

.tsm-switch-node {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--tsm-color-bg-white);
  border-radius: 100%;
  transition: left 0.3s;
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

.tsm-switch--disabled {
  cursor: not-allowed;
}

.tsm-switch--disabled .tsm-switch-text {
  color: var(--tsm-color-text-placeholder);
}

.tsm-switch--large .tsm-switch-text {
  text-align: center;
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-switch--medium .tsm-switch-text {
  text-align: center;
  font-size: var(--tsm-font-size-text-m);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-switch--small .tsm-switch-text {
  text-align: center;
  font-size: var(--tsm-font-size-text-s);
  line-height: var(--tsm-line-height-text-s);
}
</style>
