/** * Form 表单组件 * @description 表单组件，用于表单验证和提交 */
<template>
  <view class="tsm-form" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import type { FormProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * Form 组件 Props
 * @property {object} model - 表单数据
 * @property {object} rules - 表单验证规则
 * @property {boolean} showError - 是否显示错误信息
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<FormProps>(), defaultProps);

const emit = defineEmits<{
  submit: [values: Record<string, any>];
}>();

const bemClass = computed(() => {
  return bem('form', [], [], props.customClass);
});

const errors = ref<Record<string, string>>({});

const validate = async (): Promise<boolean> => {
  errors.value = {};
  let isValid = true;

  for (const field in props.rules) {
    const rules = props.rules[field];
    const value = props.model?.[field];

    for (const rule of rules) {
      if (rule.required && !value) {
        errors.value[field] = rule.message || `${field}是必填项`;
        isValid = false;
        break;
      }
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.value[field] = rule.message || `${field}格式不正确`;
        isValid = false;
        break;
      }
      if (rule.validator && value) {
        const result = rule.validator(value);
        if (result !== true) {
          errors.value[field] = result || `${field}验证失败`;
          isValid = false;
          break;
        }
      }
    }
  }

  return isValid;
};

const resetFields = () => {
  errors.value = {};
};

const submit = async () => {
  const isValid = await validate();
  if (isValid) {
    emit('submit', props.model || {});
  }
};

// 向子组件提供表单上下文
provide('formContext', {
  props,
  errors,
  validateField: (field: string, value: any) => {
    const rules = props.rules?.[field];
    if (!rules) return true;

    for (const rule of rules) {
      if (rule.required && !value) {
        errors.value[field] = rule.message || `${field}是必填项`;
        return false;
      }
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.value[field] = rule.message || `${field}格式不正确`;
        return false;
      }
    }

    delete errors.value[field];
    return true;
  },
});

defineExpose({ validate, resetFields, submit });
</script>

<style scoped lang="scss">
.tsm-form {
  width: 100%;
}
</style>
