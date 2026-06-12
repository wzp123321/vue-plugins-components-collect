/** * Radio 单选框组件 * @description 单选框组件，用于单选场景，需配合 RadioGroup 使用 */
<template>
  <view class="tsm-radio" :class="bemClass" :style="customStyle" @tap="clickHandler">
    <view class="tsm-radio__icon" :class="iconClass" :style="iconStyle">
      <!-- fillCircle 样式：选中时显示白色对号 SVG -->
      <svg
        v-if="isChecked && props.fillStyle === 'fillCircle'"
        class="tsm-radio__check"
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="7"
        viewBox="0 0 10 7"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.78514 0.195359C10.0455 0.455709 10.0455 0.877818 9.78514 1.13817L4.28981 6.6335C4.00343 6.91988 3.53911 6.91988 3.25272 6.6335L0.195291 3.57607C-0.0650587 3.31572 -0.0650591 2.89361 0.19529 2.63326C0.45564 2.37291 0.877749 2.37291 1.1381 2.63326L3.77126 5.26643L8.84233 0.195359C9.10268 -0.0649904 9.52479 -0.0649905 9.78514 0.195359Z"
          fill="white"
        />
      </svg>
      <!-- line 样式：正常选中时显示主题色对号 SVG -->
      <svg
        v-if="isChecked && props.fillStyle === 'line' && !isDisabled"
        class="tsm-radio__check-line"
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="7"
        viewBox="0 0 10 7"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.78514 0.195359C10.0455 0.455709 10.0455 0.877818 9.78514 1.13817L4.28981 6.6335C4.00343 6.91988 3.53911 6.91988 3.25272 6.6335L0.195291 3.57607C-0.0650587 3.31572 -0.0650591 2.89361 0.19529 2.63326C0.45564 2.37291 0.877749 2.37291 1.1381 2.63326L3.77126 5.26643L8.84233 0.195359C9.10268 -0.0649904 9.52479 -0.0649905 9.78514 0.195359Z"
          fill="var(--tsm-color-primary)"
        />
      </svg>
      <!-- line 样式：禁用选中时显示主题色边框对号 SVG -->
      <svg
        v-if="isChecked && props.fillStyle === 'line' && isDisabled"
        class="tsm-radio__check-line"
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="7"
        viewBox="0 0 10 7"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.78514 0.195359C10.0455 0.455709 10.0455 0.877818 9.78514 1.13817L4.28981 6.6335C4.00343 6.91988 3.53911 6.91988 3.25272 6.6335L0.195291 3.57607C-0.0650587 3.31572 -0.0650591 2.89361 0.19529 2.63326C0.45564 2.37291 0.877749 2.37291 1.1381 2.63326L3.77126 5.26643L8.84233 0.195359C9.10268 -0.0649904 9.52479 -0.0649905 9.78514 0.195359Z"
          fill="var(--tsm-color-primary-border)"
        />
      </svg>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import type { FormItemContext } from '../../tsm-form-item/uniapp/type';
import type { RadioProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<RadioProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: string | undefined];
  'update:checked': [value: boolean];
}>();

// 获取 RadioGroup 上下文
const radioGroup = inject<{
  value: Ref<string | undefined>;
  disabled: Ref<boolean | undefined>;
  readonly: Ref<boolean | undefined>;
  vertical: Ref<boolean | undefined>;
  updateValue: (value: string) => void;
}>('radioGroup', null as any);

// 注入 FormItem 上下文（在 FormItem 内使用时触发验证，独立使用同样生效）
const formItemContext = inject<FormItemContext | null>('formItemContext', null);

// 是否在 Group 中
const isInGroup = computed(() => !!radioGroup);

// 判断是否选中（根据 Group 的 value 或自身 checked）
const isChecked = computed(() => {
  if (isInGroup.value && props.value) {
    return radioGroup.value.value === props.value;
  }
  return props.checked;
});

// 判断是否禁用（自身或 Group）
const isDisabled = computed(() => props.disabled || (isInGroup.value && radioGroup?.disabled?.value));

// 判断是否只读（自身 或 Group 或 FormItem）
const isReadonly = computed(
  () => props.readonly || (isInGroup.value && radioGroup?.readonly?.value) || !!formItemContext?.readonly
);

const bemClass = computed(() => {
  return bem('radio', [isDisabled.value ? 'disabled' : ''], [], props.customClass);
});

const iconClass = computed(() => {
  return bem('radio__icon', [props.fillStyle, isChecked.value ? 'checked' : '']);
});

const iconStyle = computed(() => {
  const size = addUnit('16');

  // line 样式：未选中时完全空白，选中时只显示对号（无边框无填充）
  if (props.fillStyle === 'line') {
    return {
      width: size,
      height: size,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      borderWidth: '0',
    };
  }

  if (isDisabled.value) {
    if (isChecked.value) {
      // 选中禁用
      return {
        width: size,
        height: size,
        borderColor: 'var(--tsm-color-primary)',
        backgroundColor: 'var(--tsm-color-primary)',
        opacity: 0.5,
      };
    } else {
      // 未选中禁用
      return {
        width: size,
        height: size,
        borderColor: 'var(--tsm-color-text-disabled)',
        backgroundColor: 'var(--tsm-color-bg-tertiary)',
      };
    }
  }

  // fillCircle 正常状态
  return {
    width: size,
    height: size,
    borderColor: isChecked.value ? 'var(--tsm-color-primary)' : 'var(--tsm-color-border-primary)',
    backgroundColor: isChecked.value ? 'var(--tsm-color-primary)' : 'var(--tsm-color-bg-white)',
  };
});

const clickHandler = () => {
  if (isDisabled.value) return;
  if (isReadonly.value) return;
  if (isChecked.value) return; // 单选框：已选中则不再触发

  // 如果在 Group 中，通知 Group 更新
  if (isInGroup.value && props.value) {
    radioGroup.updateValue(props.value);
  } else if (!isInGroup.value) {
    // 独立使用：emit change 和 update:checked
    emit('update:checked', true);
    emit('change', props.value);
  }

  // 触发 FormItem change 验证
  formItemContext?.onValueChange(props.value);
};
</script>

<style scoped lang="scss">
.tsm-radio {
  height: var(--tsm-spacing-7xl);
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  margin-right: var(--tsm-spacing-3xl);
  color: var(--tsm-color-text-primary);
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-radio--disabled {
  cursor: not-allowed;
  color: var(--tsm-color-text-disabled);
}

.tsm-radio__icon {
  box-sizing: border-box;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  margin-right: var(--tsm-spacing-s);
  flex-shrink: 0;
  border-radius: 100%;
}

.tsm-radio__check,
.tsm-radio__check-line {
  width: 60%;
  display: block;
}
</style>
