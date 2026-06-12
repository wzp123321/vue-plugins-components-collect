/** * Checkbox 复选框组件 * @description 复选框组件，用于多选场景，支持未选中、半选、全选三种状态 */
<template>
  <view class="tsm-checkbox" :class="bemClass" :style="customStyle" @tap="clickHandler">
    <view class="tsm-checkbox__icon" :class="iconClass" :style="iconStyle">
      <!-- 全选状态：对勾 -->
      <view v-if="isChecked" class="tsm-checkbox__check-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.78508 0.195267C10.0454 0.455617 10.0454 0.877727 9.78508 1.13808L4.28975 6.63341C4.00336 6.91979 3.53904 6.91979 3.25266 6.63341L0.19523 3.57598C-0.0651197 3.31563 -0.0651201 2.89352 0.195229 2.63317C0.455579 2.37282 0.877688 2.37282 1.13804 2.63317L3.7712 5.26634L8.84227 0.195268C9.10262 -0.065082 9.52473 -0.065082 9.78508 0.195267Z"
            fill="white"
          />
        </svg>
      </view>
      <!-- 半选状态：横线 -->
      <view v-else-if="isIndeterminate" class="tsm-checkbox__indeterminate-icon" />
    </view>
    <text v-if="label" class="tsm-checkbox__label" :style="labelStyle" @tap.stop="labelClickHandler">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { FormItemContext } from '../../tsm-form-item/uniapp/type';
import type { CheckboxProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<CheckboxProps>(), defaultProps);

const emit = defineEmits<{
  change: [checked: boolean];
  'update:checked': [value: boolean];
  'update:indeterminate': [value: boolean];
}>();

// Inject FormItem 上下文
const formItemContext = inject<FormItemContext | null>('formItemContext', null);

// 获取 CheckboxGroup 上下文
const checkboxGroup = inject<{
  props: { modelValue?: (string | number)[]; disabled?: boolean; readonly?: boolean };
  updateValue: (name: string | number, checked: boolean) => void;
}>('checkboxGroup', null as any);

// 获取当前 checkbox 的标识（优先使用 name，其次是 value）
const checkboxName = computed(() => {
  return props.name !== '' ? props.name : props.value;
});

// 是否在 Group 中
const isInGroup = computed(() => !!checkboxGroup);

// 判断是否选中（如果在 Group 中，根据 Group 的 modelValue 判断）
const isChecked = computed(() => {
  if (isInGroup.value && checkboxName.value !== undefined && checkboxName.value !== '') {
    return checkboxGroup.props.modelValue?.includes(checkboxName.value) ?? false;
  }
  return props.checked;
});

const isIndeterminate = computed(() => props.indeterminate);

// 判断是否禁用（自身或 Group）
const isDisabled = computed(() => props.disabled || (isInGroup.value && checkboxGroup.props.disabled));

// 判断是否只读（自身或 Group 或 FormItem）
const isReadonly = computed(
  () => props.readonly || (isInGroup.value && checkboxGroup.props.readonly) || !!formItemContext?.readonly
);

const bemClass = computed(() => {
  return bem('checkbox', [isDisabled.value ? 'disabled' : ''], [], props.customClass);
});

const iconClass = computed(() => {
  const state = isChecked.value ? 'checked' : isIndeterminate.value ? 'indeterminate' : '';
  return bem('checkbox__icon', [props.shape, state]);
});

const iconStyle = computed(() => {
  const isActive = isChecked.value || isIndeterminate.value;

  // 禁用状态样式
  if (isDisabled.value) {
    if (isActive) {
      // 半选/全选 + 禁用
      return {
        width: addUnit(String(props.size)),
        height: addUnit(String(props.size)),
        borderColor: 'var(--tsm-color-primary-border)',
        backgroundColor: 'var(--tsm-color-primary-border)',
      };
    } else {
      // 未选择 + 禁用
      return {
        width: addUnit(String(props.size)),
        height: addUnit(String(props.size)),
        borderColor: 'var(--tsm-color-text-disabled)',
        backgroundColor: 'var(--tsm-color-bg-tertiary)',
      };
    }
  }

  // 正常状态
  const activeColor = props.activeColor || 'var(--tsm-color-primary)';
  return {
    width: addUnit(String(props.size)),
    height: addUnit(String(props.size)),
    borderColor: isActive ? activeColor : 'var(--tsm-color-border-primary)',
    backgroundColor: isActive ? activeColor : 'var(--tsm-color-bg-white)',
  };
});

const labelStyle = computed(() => {
  return {
    color: isDisabled.value ? 'var(--tsm-color-text-disabled)' : props.labelColor || 'var(--tsm-color-text-primary)',
    fontSize: 'var(--tsm-font-size-text-l)',
    fontFamily: 'var(--tsm-font-family-regular)',
    fontStyle: 'normal',
    fontWeight: 'var(--tsm-font-weight-regular)',
    lineHeight: 'var(--tsm-line-height-text-l)',
  };
});

const clickHandler = () => {
  if (isDisabled.value) return;
  if (isReadonly.value) return;

  const newValue = !isChecked.value;

  // 如果在 Group 中，通知 Group 更新
  if (isInGroup.value && checkboxName.value !== undefined && checkboxName.value !== '') {
    checkboxGroup.updateValue(checkboxName.value, newValue);
  }

  // 点击时取消半选状态
  if (props.indeterminate) {
    emit('update:indeterminate', false);
  }

  emit('update:checked', newValue);
  emit('change', newValue);

  // 触发 FormItem 校验
  formItemContext?.onValueChange(newValue);
};

const labelClickHandler = () => {
  if (!isDisabled.value && !isReadonly.value) {
    clickHandler();
  }
};
</script>

<style scoped lang="scss">
.tsm-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-block: var(--tsm-spacing-xl);
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
  flex-shrink: 0;
}

.tsm-checkbox__icon--circle {
  border-radius: 100%;
}

.tsm-checkbox__icon--square {
  border-radius: var(--tsm-radius-xs);
}

.tsm-checkbox__icon--checked,
.tsm-checkbox__icon--indeterminate {
  color: var(--tsm-color-bg-white);
}

.tsm-checkbox__check-icon {
  width: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
    width: 100%;
    height: auto;
  }
}

.tsm-checkbox__indeterminate-icon {
  width: 8px;
  height: 2px;
  border-radius: var(--tsm-radius-full);
  background: var(--tsm-color-text-white);
}

.tsm-checkbox__label {
  word-wrap: break-word;
  margin-left: var(--tsm-spacing-m);
  color: var(--tsm-color-text-primary);
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-checkbox--disabled .tsm-checkbox__label {
  color: var(--tsm-color-text-disabled);
}
</style>
