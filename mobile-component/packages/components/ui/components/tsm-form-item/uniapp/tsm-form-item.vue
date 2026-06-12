<template>
  <view class="tsm-form-item" :data-name="props.name" :class="bemClass" :style="mergedCustomStyle">
    <!-- Label 区域 -->
    <view v-if="props.label || slots.label" class="tsm-form-item__label" :style="labelStyle">
      <!-- 必填星号 -->
      <view v-if="showRequiredMark && formContext.requiredMarkPosition === 'left'" class="tsm-form-item__required-mark">
        *
      </view>
      <!-- Label 内容 -->
      <slot name="label">
        <text class="tsm-form-item__label-text">{{ props.label }}</text>
      </slot>
      <!-- 必填星号（右侧） -->
      <view
        v-if="showRequiredMark && formContext.requiredMarkPosition === 'right'"
        class="tsm-form-item__required-mark"
      >
        *
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="tsm-form-item__content">
      <slot />
      <!-- 帮助说明 -->
      <view v-if="props.help && !mergedReadonly" class="tsm-form-item__help">
        <text class="tsm-form-item__help-text">{{ props.help }}</text>
      </view>
      <!-- 错误信息 -->
      <view v-if="showError && errorList.length > 0" class="tsm-form-item__error">
        <text class="tsm-form-item__error-text">{{ errorMessage }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { inject, provide, computed, ref, onMounted, onUnmounted, useSlots } from 'vue';
import type { FormItemProps } from './props';
import { defaultFormItemProps } from './props';
import type { FormItemContext, FormItemValidateResult } from './type';
import type { FormContext, ValidateStatus } from '../../tsm-form/uniapp/types';
import type { FormRule, Trigger, ValidateResult } from '../../../libs/uniapp/validators/types';
import { validateRules, analysisValidateResult } from '../../../libs/uniapp/validators';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * @slot default 表单控件插槽，用于放置 input、picker 等输入组件
 * @slot label 自定义标签插槽，用于替换默认的 label 文本
 */

// Props 定义
const props = withDefaults(defineProps<FormItemProps>(), defaultFormItemProps);

// Slots
const slots = useSlots();

// Inject Form 上下文
const formContext = inject<FormContext>('formContext', {
  model: {},
  rules: {},
  errorMessage: undefined,
  labelAlign: 'top',
  labelWidth: 80,
  scrollToFirstError: '',
  showErrorMessage: true,
  requiredMark: true,
  requiredMarkPosition: 'right',
  readonly: false,
  requiredMarkOnReadonly: false,
  addChild: () => {},
  removeChild: () => {},
});

// 验证状态
const validateStatus = ref<ValidateStatus>(0); // TO_BE_VALIDATED
// 错误列表
const errorList = ref<ValidateResult[]>([]);

// 合并配置（FormItem > Form）
const mergedReadonly = computed(() => {
  if (props.readonly !== undefined) return props.readonly;
  return formContext.readonly;
});

const mergedLabelAlign = computed(() => {
  if (props.labelAlign !== undefined) return props.labelAlign;
  return formContext.labelAlign;
});

const mergedLabelWidth = computed(() => {
  if (props.labelWidth !== undefined) return props.labelWidth;
  return formContext.labelWidth;
});

const mergedCustomStyle = computed(() => props.customStyle || {});

// Label 样式
const labelStyle = computed(() => {
  if (mergedLabelAlign.value === 'top') {
    return {};
  }
  return {
    width: `${mergedLabelWidth.value}px`,
    textAlign: mergedLabelAlign.value,
  };
});

// BEM class
const bemClass = computed(() => {
  return bem(
    'form-item',
    [
      showError.value && errorList.value.length > 0 ? 'error' : '',
      showRequiredMark.value ? 'required' : '',
      mergedReadonly.value ? 'readonly' : '',
      mergedLabelAlign.value === 'top' ? 'label-top' : '',
      mergedLabelAlign.value === 'left' ? 'label-left' : '',
      mergedLabelAlign.value === 'right' ? 'label-right' : '',
    ],
    []
  );
});

// 获取验证规则
const mergedRules = computed<FormRule[]>(() => {
  if (props.rules !== undefined) return props.rules;
  return formContext.rules[props.name] || [];
});

// 判断是否必填（用于显示星号）
const isRequired = computed(() => {
  return mergedRules.value.some(rule => rule.required);
});

// 是否显示必填星号
const showRequiredMark = computed(() => {
  // 只读模式下按 requiredMarkOnReadonly 配置
  if (mergedReadonly.value) {
    return formContext.requiredMarkOnReadonly && isRequired.value;
  }
  // 正常模式下按配置
  if (props.requiredMark !== undefined) return props.requiredMark && isRequired.value;
  return formContext.requiredMark && isRequired.value;
});

// 是否显示错误信息
const showError = computed(() => {
  return formContext.showErrorMessage && validateStatus.value === 2; // FAIL
});

// 显示的错误消息（取第一条）
const errorMessage = computed(() => {
  if (errorList.value.length > 0) {
    return errorList.value[0].message || '';
  }
  return '';
});

/**
 * 根据 trigger 过滤规则
 * @param rules - 验证规则列表
 * @param trigger - 触发时机
 * @description
 * - trigger='all' 时，验证所有规则（表单提交时使用）
 * - trigger='blur'/'change' 时，只验证对应 trigger 的规则
 * - 规则未指定 trigger 时默认为 'change'
 * - 支持规则 trigger 为数组（如 ['blur', 'change']）
 */
function filterRulesByTrigger(rules: FormRule[], trigger: Trigger): FormRule[] {
  // 'all' 时验证所有规则（submit 使用）
  if (trigger === 'all') return rules;

  // blur/change 时只验证对应 trigger 的规则
  return rules.filter(rule => {
    const ruleTrigger = rule.trigger || 'change'; // 未指定默认为 change
    if (typeof ruleTrigger === 'string') {
      return ruleTrigger === trigger;
    }
    if (Array.isArray(ruleTrigger)) {
      return ruleTrigger.includes(trigger);
    }
    return false;
  });
}

/**
 * 验证字段
 * @param model - 表单数据
 * @param trigger - 触发时机
 * @param showErrorMessage - 是否显示错误信息
 */
async function validate(
  model: Record<string, any>,
  trigger: Trigger,
  showErrorMessage = true
): Promise<FormItemValidateResult> {
  // 获取字段值
  const value = model[props.name];

  // 过滤规则
  const filteredRules = filterRulesByTrigger(mergedRules.value, trigger);

  // 无规则时返回成功
  if (filteredRules.length === 0) {
    validateStatus.value = 1; // SUCCESS
    errorList.value = [];
    return { name: props.name, result: true };
  }

  // 执行验证
  const results = await validateRules(
    value,
    filteredRules,
    {
      name: props.name,
      label: props.label, // 优先使用 label（更友好）
      formData: model,
    },
    formContext.errorMessage
  );

  // 分析结果
  const errors = analysisValidateResult(results);

  // 更新状态
  if (errors.length > 0) {
    validateStatus.value = 2; // FAIL
    errorList.value = showErrorMessage ? errors : [];
  } else {
    validateStatus.value = 1; // SUCCESS
    errorList.value = [];
  }

  return {
    name: props.name,
    result: errors.length === 0,
    errorList: errors,
  };
}

/**
 * 仅验证（不显示错误信息，不更新状态）
 * @param trigger - 触发时机
 */
async function validateOnly(trigger: Trigger): Promise<FormItemValidateResult> {
  // 获取字段值
  const value = formContext.model[props.name];

  // 过滤规则
  const filteredRules = filterRulesByTrigger(mergedRules.value, trigger);

  // 无规则时返回成功
  if (filteredRules.length === 0) {
    return { name: props.name, result: true };
  }

  // 执行验证
  const results = await validateRules(
    value,
    filteredRules,
    {
      name: props.name,
      label: props.label, // 优先使用 label（更友好）
      formData: formContext.model,
    },
    formContext.errorMessage
  );

  // 分析结果
  const errors = analysisValidateResult(results);

  return {
    name: props.name,
    result: errors.length === 0,
    errorList: errors,
  };
}

/**
 * 清除验证状态
 */
function clearValidate() {
  validateStatus.value = 0; // TO_BE_VALIDATED
  errorList.value = [];
}

/**
 * 重置字段（清除验证状态）
 * @description 数据重置由 Form 组件负责，FormItem 只清除验证状态
 */
function resetField() {
  clearValidate();
}

/**
 * 滚动到视图
 * @param type - 滚动方式
 */
function scrollIntoView(type: 'smooth' | 'auto') {
  // H5 环境使用 scrollIntoView API
  const element = document.querySelector(`.tsm-form-item[data-name="${props.name}"]`);
  if (element) {
    element.scrollIntoView({
      behavior: type,
      block: 'center',
    });
  }
}

/**
 * blur 触发验证（供输入组件调用）
 * @description 只在规则中定义了 blur trigger 时才验证
 */
function onBlur() {
  // 只读模式不触发验证
  if (mergedReadonly.value) return;

  // 检查是否有 blur 触发的规则
  const blurRules = filterRulesByTrigger(mergedRules.value, 'blur');
  if (blurRules.length === 0) return;

  validate(formContext.model, 'blur', formContext.showErrorMessage);
}

/**
 * @todo: input传入的value有问题--但这个value目前看内部也不需要使用
 * 值变化触发验证（供输入组件调用）
 * @description 只在规则中定义了 change trigger 时才验证
 * @param value - 当前字段值
 */
function onValueChange(value: any) {
  // 只读模式不触发验证
  if (mergedReadonly.value) return;

  // 更新 model 值（如果输入组件传递了新值）
  // if (formContext.model && props.name) {
  //   formContext.model[props.name] = value;
  // }

  // 检查是否有 change 触发的规则（包括未指定 trigger 的规则，默认为 change）
  const changeRules = filterRulesByTrigger(mergedRules.value, 'change');
  if (changeRules.length === 0) return;

  validate(formContext.model, 'change', formContext.showErrorMessage);
}

// Provide 上下文给输入组件
provide<FormItemContext>('formItemContext', {
  name: props.name,
  get readonly() {
    return mergedReadonly.value;
  },
  onBlur,
  onValueChange,
  validate: (trigger: Trigger) => validate(formContext.model, trigger, formContext.showErrorMessage),
  validateOnly,
  clearValidate,
  resetField,
});

// 暴露方法供 Form 调用
defineExpose({
  name: props.name,
  validate,
  validateOnly,
  clearValidate,
  resetField,
  scrollIntoView,
});

// 注册到 Form
onMounted(() => {
  formContext.addChild({
    name: props.name,
    validate,
    validateOnly,
    clearValidate,
    resetField,
    scrollIntoView,
  });
});

// 从 Form 移除
onUnmounted(() => {
  formContext.removeChild(props.name);
});
</script>

<style scoped lang="scss">
.tsm-form-item {
  font-family: var(--tsm-font-family-regular);
  display: flex;
  flex-wrap: wrap;
}

.tsm-form-item__label {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--tsm-spacing-xs, 4px);
}

.tsm-form-item__label-text {
  color: var(--tsm-color-text-secondary, #717680);
  font-size: var(--tsm-font-size-text-l, 16px);
  line-height: var(--tsm-line-height-text-l, 24px);
  font-weight: var(--tsm-font-weight-regular);
  word-break: break-all;
}

.tsm-form-item__required-mark {
  color: var(--tsm-color-danger, #d92d20);
  font-size: var(--tsm-font-size-text-l, 16px);
  line-height: var(--tsm-line-height-text-l, 24px);
  font-weight: var(--tsm-font-weight-regular);
  width: 8px;
  text-align: center;
}

.tsm-form-item__content {
  flex: 1;
  min-width: 0;
}

.tsm-form-item__help {
  line-height: var(--tsm-line-height-text-s, 20px);
  margin-top: var(--tsm-spacing-xs, 4px);
  padding-left: 0;
}

.tsm-form-item__help-text {
  color: var(--tsm-color-text-secondary, #717680);
  font-size: var(--tsm-font-size-text-s, 12px);
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-form-item__error {
  line-height: var(--tsm-line-height-text-s, 20px);
  margin-top: var(--tsm-spacing-xs, 4px);
  padding-left: 0;
}

.tsm-form-item__error-text {
  color: var(--tsm-color-danger, #d92d20);
  font-size: var(--tsm-font-size-text-s, 12px);
  line-height: var(--tsm-line-height-text-s, 20px);
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-form-item--label-top {
  flex-direction: column;
}

.tsm-form-item--label-top .tsm-form-item__label {
  width: 100%;
  padding-bottom: var(--tsm-spacing-xs, 4px);
  padding-right: 0;
}

.tsm-form-item--label-left .tsm-form-item__label {
  justify-content: flex-start;
  padding-right: var(--tsm-spacing-m, 8px);
}

.tsm-form-item--label-right .tsm-form-item__label {
  justify-content: flex-end;
  padding-right: var(--tsm-spacing-m, 8px);
}

.tsm-form-item--readonly {
  // opacity: 0.7;
}
</style>
