/** * Input 输入框组件 * @description 输入框组件，用于文本输入 */
<template>
  <view class="tsm-input" :class="bemClass" :style="customStyle">
    <input
      class="tsm-input__field"
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled || readonly"
      :maxlength="maxlength"
      :focus="autofocus"
      :password="type === 'password'"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onConfirm"
    />
    <view v-if="clearable && inputValue && !disabled" class="tsm-input__clear" @tap="onClear">
      <icon-setting />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { InputProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * Input 组件 Props
 * @property {string} value - 输入框的值
 * @property {string} type - 输入框类型 (text | number | idcard | digit | password | tel)
 * @property {string} placeholder - 占位符
 * @property {boolean} disabled - 是否禁用
 * @property {boolean} readonly - 是否只读
 * @property {number} maxlength - 最大长度
 * @property {boolean} clearable - 是否显示清除按钮
 * @property {boolean} autofocus - 是否自动聚焦
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<InputProps>(), defaultProps);

const emit = defineEmits<{
  input: [value: string];
  focus: [event: any];
  blur: [event: any];
  confirm: [event: any];
  change: [value: string];
  'update:value': [value: string];
}>();

const inputValue = ref(props.value);

watch(
  () => props.value,
  newVal => {
    inputValue.value = newVal;
  }
);

const bemClass = computed(() => {
  return bem('input', [props.disabled ? 'disabled' : ''], [], props.customClass);
});

const onInput = (e: any) => {
  const value = e.detail.value;
  inputValue.value = value;
  emit('update:value', value);
  emit('input', value);
  emit('change', value);
};

const onFocus = (e: any) => {
  emit('focus', e);
};

const onBlur = (e: any) => {
  emit('blur', e);
};

const onConfirm = (e: any) => {
  emit('confirm', e);
};

const onClear = () => {
  inputValue.value = '';
  emit('update:value', '');
  emit('input', '');
  emit('change', '');
};
</script>

<style scoped lang="scss">
.tsm-input {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.tsm-input--disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.tsm-input__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #303133;
}

.tsm-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
}
</style>
