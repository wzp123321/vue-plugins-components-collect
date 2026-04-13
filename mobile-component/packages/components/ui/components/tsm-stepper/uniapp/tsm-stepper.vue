/** * Button 按钮 * @description 按钮组件，支持各种形状、大小、加载等功能。 */
<template>
  <view class="tsm-stepper" :style="stepperStyle" :class="bemClass">
    <view
      :class="{ 'is-disabled': isDisabled(StepperOperation.Minus) }"
      class="tsm-stepper-operation tsm-stepper-minus"
      hover-class="tsm-stepper-hover"
      hover-stay-time="150"
      @tap="clickHandler(StepperOperation.Minus)"
      @touchstart="onTouchStart(StepperOperation.Minus)"
      @touchend.stop="onTouchEnd"
    >
      <icon-minus :color="btnColor(isDisabled(StepperOperation.Minus) || props.disabled)" />
    </view>
    <view class="tsm-stepper-value">
      <input :disabled="props.disabled" v-model="currentValue" @blur="onBlur" @input="onInput" type="number" />
    </view>
    <view
      :class="{ 'is-disabled': isDisabled(StepperOperation.Plus) }"
      class="tsm-stepper-operation tsm-stepper-add"
      hover-class="tsm-stepper-hover"
      hover-stay-time="150"
      @tap="clickHandler(StepperOperation.Plus)"
      @touchstart="onTouchStart(StepperOperation.Plus)"
      @touchend.stop="onTouchEnd"
    >
      <icon-add :color="btnColor(isDisabled(StepperOperation.Plus) || props.disabled)" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { StepperProps } from './props';
import { defaultProps, StepperOperation } from './props';
import { addStyle, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<StepperProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: number];
  'update:modelValue': [value: number];
  blur: [value: number];
}>();

const bemClass = computed(() => {
  return bem(
    'stepper',
    [],
    [
      ['disabled', props.disabled],
      ['small', props.small],
    ],
    props.customClass
  );
});
const stepperStyle = computed(() => {
  const style: Record<string, string> = {};
  return addStyle({ ...style, ...props.customStyle });
});

const btnColor = (disabled: boolean) =>
  disabled ? 'var(--tsm-color-text-placeholder)' : 'var(--tsm-color-text-primary)';

// 当前值
const currentValue = ref(props.modelValue);

/**
 * 操作按钮禁用
 * @param type
 */
const isDisabled = (type: StepperOperation) => {
  if (type === StepperOperation.Plus) {
    // 在点击增加按钮情况下，判断整体的disabled，是否单独禁用增加按钮，以及当前值是否大于最大的允许值
    return props.disabled || Number(currentValue.value) >= Number(props.max);
  }
  // 点击减少按钮同理
  return props.disabled || Number(currentValue.value) <= Number(props.min);
};

const updateValue = (value: number) => {
  currentValue.value = value;
  emit('update:modelValue', value);
};

// 格式化整理数据，限制范围
const format = (value: number | string) => {
  value = filter(value);
  // 如果为空字符串，那么设置为0，同时将值转为Number类型
  value = value === '' ? 0 : +value;
  // 对比最大最小值，取在min和max之间的值
  value = Math.max(Math.min(Number(props.max), value), Number(props.min));
  return value;
};
// 过滤非法的字符
const filter = (value: number | string) => {
  // 只允许0-9之间的数字，"."为小数点，"-"为负数时候使用
  value = String(value).replace(/[^0-9.-]/g, '');
  // 如果只允许输入整数，则过滤掉小数点后的部分
  if (value.indexOf('.') !== -1) {
    value = value.split('.')[0];
  }
  return value;
};

let longPressTimer: any = null;
let operateType: StepperOperation = StepperOperation.Minus;

const onChange = () => {
  if (isDisabled(operateType)) {
    return;
  }
  const diff = operateType === StepperOperation.Minus ? -Number(props.step) : Number(props.step);
  const value = format(+currentValue.value + diff);
  updateValue(value);
  emit('change', value);
};
// 点击加减按钮
const clickHandler = (type: StepperOperation) => {
  operateType = type;
  onChange();
};
// 清除定时器
const clearTimeoutFn = () => {
  clearTimeout(longPressTimer);
  longPressTimer = null;
};
const longPressStep = () => {
  // 每隔一段时间，重新调用longPressStep方法，实现长按加减
  clearTimeoutFn();
  longPressTimer = setTimeout(() => {
    onChange();
    longPressStep();
  }, 250);
};
/**
 * 触摸开始，实现长按加减
 * @param type
 */
const onTouchStart = (type: StepperOperation) => {
  clearTimeoutFn();
  operateType = type;
  // 一定时间后，默认达到长按状态
  longPressTimer = setTimeout(() => {
    onChange();
    longPressStep();
  }, 600);
};
/**
 * 触摸结束，清除定时器，停止长按加减
 */
const onTouchEnd = () => {
  clearTimeoutFn();
};

// 输入框失去焦点
const onBlur = (event: any) => {
  // 对输入值进行格式化
  const value = format(event.detail.value);
  updateValue(value);
  // 发出blur事件
  emit('blur', value);
};
// 输入框值发生变化
const onInput = (e: any) => {
  nextTick(() => {
    const { value = '' } = e.detail || {};
    // 为空返回
    if (value === '') {
      // 为空自动设为最小值
      updateValue(Number(props.min));
      emit('change', Number(props.min));
      return;
    }
    const formatted = filter(value);
    updateValue(Number(formatted));
    emit('change', Number(formatted));
  });
};

watch(
  () => props.modelValue,
  () => {
    updateValue(format(props.modelValue));
  }
);

onMounted(() => {
  updateValue(format(props.modelValue));
});
</script>

<style scoped lang="scss">
.tsm-stepper {
  display: flex;
  flex: 1 1 144px;
  height: 40px;
  min-width: 144px;
  overflow: hidden;

  justify-content: center;
  align-items: center;
  gap: var(--tsm-padding-sm);
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-white);
  box-sizing: border-box;

  border-radius: var(--tsm-border-radius-sm, 8px);
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-white);

  /* Shadow/shadow-xs */
  box-shadow: 0 1px 2px 0 var(--Effects-Shadows-shadow-xs, rgba(10, 13, 18, 0.05));
}

.tsm-stepper-minus {
  border-right: 1px solid var(--tsm-color-border-primary);
}

.tsm-stepper-value {
  flex: 1 1 0%;
  width: 0;
  min-width: 0;
  overflow: hidden;
}

.tsm-stepper-value input {
  text-align: center;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  color: var(--tsm-color-text-primary);
}

.tsm-stepper-add {
  border-left: 1px solid var(--tsm-color-border-primary);
}

.tsm-stepper-operation {
  width: 40px;
  max-width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.tsm-stepper-operation .icon {
  width: 20px;
  height: 20px;
}

.tsm-stepper.tsm-stepper--small {
  flex: 1 1 128px;
  min-width: 128px;
  height: 32px;
}

.tsm-stepper.tsm-stepper--small .tsm-stepper-operation {
  width: 32px;
  max-width: 32px;
  flex-shrink: 0;
  height: 32px;
}

.tsm-stepper.tsm-stepper--small .tsm-stepper-operation .icon {
  width: 14px;
  height: 14px;
}

.tsm-stepper.tsm-stepper--disabled,
.tsm-stepper-minus.is-disabled,
.tsm-stepper-add.is-disabled,
.tsm-stepper-operation.tsm-stepper-hover {
  background: var(--tsm-color-bg-disabled);
}

.tsm-stepper.tsm-stepper--disabled .tsm-stepper-value input {
  color: var(--tsm-color-text-placeholder);
}
</style>
