<template>
  <view class="tsm-form" :style="mergedCustomStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { provide, computed, ref, onUnmounted } from 'vue';
import type { FormProps } from './props';
import { defaultFormProps } from './props';
import type { FormContext, FormItemInstance, FormValidateResult } from './types';
import type { Trigger, ValidateResult } from '../../../libs/uniapp/validators/types';

/**
 * @slot default 表单内容插槽，用于放置 FormItem 等表单项
 */

// Props 定义
const props = withDefaults(defineProps<FormProps>(), defaultFormProps);

// 事件定义
const emit = defineEmits<{
  /** 提交事件 */
  (e: 'submit', value: { validateResult: FormValidateResult; firstError: string }): void;
  /** 重置事件 */
  (e: 'reset', value: { formData: Record<string, any> }): void;
}>();

// 自定义样式合并
const mergedCustomStyle = computed(() => props.customStyle || {});

// 子组件管理（FormItem 实例列表）
const children = ref<FormItemInstance[]>([]);

/**
 * 添加子组件
 * @param child - FormItem 实例
 */
function addChild(child: FormItemInstance) {
  if (!children.value.find(item => item.name === child.name)) {
    children.value.push(child);
  }
}

/**
 * 移除子组件
 * @param name - 字段名
 */
function removeChild(name: string) {
  const index = children.value.findIndex(item => item.name === name);
  if (index > -1) {
    children.value.splice(index, 1);
  }
}

/**
 * 根据字段类型获取对应的空值
 * @param name - 字段名
 * @returns 空值（数组→[]，对象→{}，数字→0，其他→''）
 */
function getEmptyValue(name: string): any {
  const currentValue = props.model[name];

  if (Array.isArray(currentValue)) {
    return [];
  }
  if (typeof currentValue === 'object' && currentValue !== null) {
    return {};
  }
  if (typeof currentValue === 'number') {
    return 0;
  }
  return '';
}

/**
 * 获取需要验证的字段列表
 * @param fields - 指定字段（可选）
 */
function getValidateFields(fields?: string[]): FormItemInstance[] {
  if (fields && fields.length > 0) {
    return children.value.filter(child => fields.includes(child.name));
  }
  return children.value;
}

/**
 * 验证全部字段
 * @param params - 验证参数
 * @returns 验证结果
 */
async function validate(params?: { trigger?: Trigger; fields?: string[] }): Promise<FormValidateResult> {
  const { trigger = 'all', fields } = params || {};
  const validateChildren = getValidateFields(fields);

  // 并行验证所有字段
  const results = await Promise.all(
    validateChildren.map(child => child.validate(props.model, trigger, props.showErrorMessage))
  );

  // 汇总验证结果
  const errorResults: Record<string, ValidateResult[]> = {};
  let hasError = false;

  for (const result of results) {
    if (!result.result) {
      hasError = true;
      errorResults[result.name] = result.errorList || [];
    }
  }

  // 有错误时滚动到第一个错误
  if (hasError && props.scrollToFirstError) {
    const firstErrorField = results.find(r => !r.result);
    if (firstErrorField) {
      const errorChild = children.value.find(child => child.name === firstErrorField.name);
      if (errorChild) {
        errorChild.scrollIntoView(props.scrollToFirstError);
      }
    }
  }

  return hasError ? errorResults : true;
}

/**
 * 仅验证（不显示错误信息，不更新状态）
 * @param params - 验证参数
 * @returns 验证结果
 */
async function validateOnly(params?: { trigger?: Trigger; fields?: string[] }): Promise<FormValidateResult> {
  const { trigger = 'all', fields } = params || {};
  const validateChildren = getValidateFields(fields);

  // 并行验证所有字段（不显示错误）
  const results = await Promise.all(validateChildren.map(child => child.validateOnly(trigger)));

  // 汇总验证结果
  const errorResults: Record<string, ValidateResult[]> = {};
  let hasError = false;

  for (const result of results) {
    if (!result.result) {
      hasError = true;
      errorResults[result.name] = result.errorList || [];
    }
  }

  return hasError ? errorResults : true;
}

/**
 * 重置表单
 * @param params - 重置参数
 * @description 根据字段类型智能重置为空值（数组→[]，对象→{}，数字→0，其他→''）
 */
function reset(params?: { fields?: string[] }) {
  const { fields } = params || {};
  const resetChildren = getValidateFields(fields);

  resetChildren.forEach(child => {
    // 根据类型智能设置空值
    props.model[child.name] = getEmptyValue(child.name);
    // 清除验证状态
    child.clearValidate();
  });

  // 触发 reset 事件
  emit('reset', { formData: props.model });
}

/**
 * 清除验证结果
 * @param fields - 指定字段（可选）
 */
function clearValidate(fields?: string[]) {
  const clearChildren = getValidateFields(fields);
  clearChildren.forEach(child => child.clearValidate());
}

/**
 * 获取第一个错误信息
 * @param validateResult - 验证结果
 */
function getFirstError(validateResult: FormValidateResult): string {
  if (validateResult === true) return '';
  const firstKey = Object.keys(validateResult)[0];
  if (!firstKey) return '';

  const errorList = validateResult[firstKey];
  if (Array.isArray(errorList) && errorList.length > 0) {
    return errorList[0].message || '';
  }
  return '';
}

/**
 * 提交表单
 * @returns 验证结果
 */
async function submit(): Promise<FormValidateResult> {
  const validateResult = await validate({ trigger: 'all' });
  const firstError = getFirstError(validateResult);

  // 触发 submit 事件
  emit('submit', { validateResult, firstError });

  return validateResult;
}

// 提供上下文给 FormItem
provide<FormContext>('formContext', {
  model: props.model,
  rules: props.rules || {},
  errorMessage: props.errorMessage,
  labelAlign: props.labelAlign,
  labelWidth: props.labelWidth,
  scrollToFirstError: props.scrollToFirstError,
  showErrorMessage: props.showErrorMessage,
  requiredMark: props.requiredMark,
  requiredMarkPosition: props.requiredMarkPosition,
  readonly: props.readonly,
  requiredMarkOnReadonly: props.requiredMarkOnReadonly,
  addChild,
  removeChild,
});

// 暴露方法供外部调用
defineExpose({
  validate,
  validateOnly,
  reset,
  clearValidate,
  submit,
});

// 组件卸载时清理
onUnmounted(() => {
  children.value = [];
});
</script>

<style scoped lang="scss">
.tsm-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--tsm-spacing-3xl);
}
</style>
