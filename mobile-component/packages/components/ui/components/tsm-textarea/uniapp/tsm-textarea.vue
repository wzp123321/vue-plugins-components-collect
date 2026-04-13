/** * Textarea 多行输入框组件 * @description 多行输入框组件，用于长文本输入 */
<template>
  <view class="tsm-textarea" :class="[customClass, { 'tsm-textarea--disabled': disabled }]" :style="textareaStyleObj">
    <textarea
      class="tsm-textarea__field"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled || readonly"
      :maxlength="maxlength"
      :focus="autofocus"
      :auto-height="rows === 1"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onConfirm"
    />
    <view v-if="showCount" class="tsm-textarea__count">
      {{ inputValue.length }}{{ maxlength > 0 ? `/${maxlength}` : '' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TextareaProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * Textarea 组件 Props
 * @property {string} value - 输入框的值
 * @property {string} placeholder - 占位符
 * @property {boolean} disabled - 是否禁用
 * @property {boolean} readonly - 是否只读
 * @property {number} maxlength - 最大长度
 * @property {boolean} autofocus - 是否自动聚焦
 * @property {boolean} showCount - 是否显示字数统计
 * @property {number} rows - 行数
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<TextareaProps>(), defaultProps);

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

const textareaStyleObj = computed(() => {
  return addStyle({
    minHeight: `${props.rows * 24}px`,
    ...props.customStyle,
  });
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
</script>

<style scoped lang="scss">
.tsm-textarea {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
}

.tsm-textarea--disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.tsm-textarea__field {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #303133;
  line-height: 24px;
  min-height: 48px;
}

.tsm-textarea__count {
  position: absolute;
  right: 8px;
  bottom: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
