/** * Tag 标签组件 * @description 标签组件，用于标记和分类 */
<template>
  <view class="tsm-tag" :class="bemClass" @tap="handleSelect">
    <view class="tsm-tag-icon" v-if="slots.icon">
      <slot name="icon" />
    </view>
    <view class="tsm-tag-content">
      <text v-if="!props.selectable" class="tsm-tag-text">
        <slot>{{ text }}</slot>
      </text>
      <view v-else class="tsm-tag-action-content">
        <view v-if="isInputType" class="tsm-tag-action-input" @tap.stop>
          <slot />
        </view>
        <slot v-else>
          <text v-if="isSelectType" class="tsm-tag-action-label">{{ props.label }}</text>
        </slot>
      </view>
    </view>
    <view class="tsm-tag-clear" v-if="showClear" @tap.stop="handleClear">
      <icon-circle-close-fill />
    </view>
    <icon-close
      v-if="!props.selectable && props.closable"
      class="tsm-tag-close"
      :color="closeIconColor"
      @tap="onClose"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue';
import { type TagProps, defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const slots = useSlots();

const props = withDefaults(defineProps<TagProps>(), defaultProps);

const emit = defineEmits<{
  /** 点击标签时触发 */
  click: [];
  /** 点击关闭按钮时触发 */
  close: [];
  /** 标签状态变化时触发 */
  change: [
    {
      selected: boolean;
      value: string | number | null | undefined;
      label: string | undefined;
      selectType: 'input' | 'select';
    },
  ];
  /** 更新选中状态 */
  'update:selected': [value: boolean];
  /** 更新绑定值 */
  'update:value': [value: string | number | null];
}>();

const isSelectType = computed(() => props.selectable && props.selectType === 'select');

const isInputType = computed(() => props.selectable && props.selectType === 'input');

const hasActionValue = computed(() => props.value !== '' && props.value !== null && props.value !== undefined);

const innerSelected = ref(props.selected);

watch(
  () => props.selected,
  value => {
    innerSelected.value = value;
  }
);

const isSelected = computed(() => {
  if (!props.selectable) {
    return false;
  }

  if (isInputType.value) {
    return hasActionValue.value;
  }

  return innerSelected.value;
});

const showClear = computed(() => {
  return props.selectable && !props.disabled && isInputType.value && isSelected.value;
});

const bemClass = computed(() => {
  const modifiers: string[] = [props.selectable ? 'selectable' : 'un-selectable'];

  if (props.selectable) {
    modifiers.push(`select-${props.selectType}`, isSelected.value ? 'selected' : 'unselected');
    if (props.disabled) {
      modifiers.push('disabled');
    }
  } else {
    modifiers.push(props.type, props.size, props.shape);
    if (props.borderless) {
      modifiers.push('borderless');
    }
  }

  return bem('tag', modifiers, []);
});

const closeIconColor = computed(() => {
  if (props.selectable && props.disabled) {
    return 'var(--tsm-color-text-disabled)';
  }

  switch (props.type) {
    case 'primary':
      return 'var(--tsm-color-primary-light)';
    case 'success':
      return 'var(--tsm-color-success-light)';
    case 'warning':
      return 'var(--tsm-color-warning-light)';
    case 'error':
      return 'var(--tsm-color-danger-light)';
    default:
      return 'var(--tsm-color-text-quaternary)';
  }
});

const handleSelect = () => {
  if (props.selectable && !props.disabled) {
    const nextSelected = isSelectType.value ? !innerSelected.value : !isSelected.value;

    if (isSelectType.value) {
      innerSelected.value = nextSelected;
    }

    emit('update:selected', nextSelected);
    emit('change', {
      selected: nextSelected,
      value: props.value,
      label: props.label,
      selectType: props.selectType,
    });
  }

  emit('click');
};

const handleClear = () => {
  if (!showClear.value) {
    return;
  }

  if (isSelectType.value) {
    innerSelected.value = false;
  }

  const nextValue = isInputType.value ? '' : props.value;
  if (isInputType.value) {
    emit('update:value', nextValue);
  }

  emit('update:selected', false);
  emit('change', {
    selected: false,
    value: nextValue,
    label: props.label,
    selectType: props.selectType,
  });
};

const onClose = () => {
  if (props.selectable && props.disabled) {
    return;
  }
  emit('close');
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-tag {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
}

.tsm-tag-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--selectable {
  display: flex;
  flex-direction: row;
  height: var(--tsm-control-height-l);
  min-height: 40px;
  padding: var(--tsm-spacing-none) var(--tsm-spacing-m);
  justify-content: center;
  align-items: center;
  gap: var(--tsm-spacing-xs);
  flex: 1 0 0;
  border-radius: var(--tsm-radius-s);
  background: var(--tsm-color-bg-tertiary);
}

.tsm-tag--selectable .tsm-tag-action-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  width: 100%;
}

.tsm-tag--selectable .tsm-tag-action-input {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.tsm-tag--selectable .tsm-tag-action-input :deep(.tsm-input),
.tsm-tag--selectable .tsm-tag-action-input :deep(.tsm-input *) {
  text-align: center;
  background-color: transparent;
  border: none;
  outline: none;
  box-shadow: none;
}

.tsm-tag--selectable .tsm-tag-action-label {
  color: var(--tsm-color-text-primary);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: 1;
}

.tsm-tag--selectable .tsm-tag-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.tsm-tag--selectable .tsm-tag-icon .icon {
  width: 16px;
  height: 16px;
}

.tsm-tag--selectable .tsm-tag-content {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
}

.tsm-tag--selectable .tsm-tag-clear {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--tsm-color-primary);
}

.tsm-tag--selectable .tsm-tag-icon .icon {
  color: var(--tsm-color-text-quaternary);
}

.tsm-tag--selectable.tsm-tag--unselected {
  background: var(--tsm-color-bg-tertiary);
}

.tsm-tag--selectable.tsm-tag--unselected .tsm-tag-action-label {
  color: var(--tsm-color-text-primary);
}

.tsm-tag--selectable.tsm-tag--unselected .tsm-tag-icon :deep(.icon) {
  color: var(--tsm-color-text-placeholder);
}

.tsm-tag--selectable.tsm-tag--selected {
  background: var(--tsm-color-primary-bg);
}

.tsm-tag--selectable.tsm-tag--selected .tsm-tag-action-label {
  color: var(--tsm-color-primary);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tag--selectable .tsm-tag-action-input :deep(.tsm-input) {
  caret-color: var(--tsm-color-primary);
}

.tsm-tag--selectable .tsm-tag-action-input :deep(.tsm-input) .tsm-input-field .uni-input-placeholder {
  color: var(--tsm-color-text-placeholder);
}

.tsm-tag--selectable.tsm-tag--selected .tsm-tag-action-input :deep(.tsm-input),
.tsm-tag--selectable.tsm-tag--selected .tsm-tag-action-input :deep(.tsm-input *) {
  color: var(--tsm-color-primary);
}

.tsm-tag--selectable.tsm-tag--selected :deep(.tsm-tag-icon) > .icon > svg {
  color: var(--tsm-color-primary) !important;
}

.tsm-tag--selectable.tsm-tag--disabled {
  pointer-events: none;
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--unselected {
  background: var(--tsm-color-bg-disabled);
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--unselected .tsm-tag-action-label {
  color: var(--tsm-color-text-quaternary);
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--unselected :deep(.tsm-tag-icon) > .icon > svg {
  color: var(--tsm-color-text-disabled) !important;
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--selected {
  background: var(--tsm-color-primary-bg);
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--selected .tsm-tag-action-label {
  color: var(--tsm-color-primary-border);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--selected .tsm-tag-action-input :deep(.tsm-input),
.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--selected .tsm-tag-action-input :deep(.tsm-input *) {
  color: var(--tsm-color-primary-border);
}

.tsm-tag--selectable.tsm-tag--disabled.tsm-tag--selected :deep(.tsm-tag-icon) > .icon > svg {
  color: var(--tsm-color-text-disabled) !important;
}

.tsm-tag--un-selectable {
  padding: 0 var(--tsm-spacing-s);
  border-radius: var(--tsm-radius-xs);
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-tertiary);
}

.tsm-tag--un-selectable .tsm-tag-text {
  color: var(--tsm-color-text-secondary);
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: 1;
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--un-selectable .tsm-tag-icon {
  margin-right: var(--tsm-spacing-xs);
  width: 14px;
  height: 14px;
}

.tsm-tag--un-selectable .tsm-tag-icon :deep(.icon) {
  width: 14px;
  height: 14px;
}

.tsm-tag--un-selectable .tsm-tag-close {
  margin-left: var(--tsm-spacing-xs);
  width: 12px;
  height: 12px;
}

.tsm-tag--un-selectable.tsm-tag--small {
  height: 18px;
}

.tsm-tag--un-selectable.tsm-tag--medium {
  height: 22px;
}

.tsm-tag--un-selectable.tsm-tag--large {
  height: 26px;
}

.tsm-tag--un-selectable.tsm-tag--bubble {
  border-radius: 100px;
}

.tsm-tag--un-selectable.tsm-tag--default {
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-tertiary);
}

.tsm-tag--un-selectable.tsm-tag--default .tsm-tag-text {
  color: var(--tsm-color-text-quaternary);
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--un-selectable.tsm-tag--default :deep(.tsm-tag-icon) > .icon {
  color: var(--tsm-color-text-quaternary);
}

.tsm-tag--un-selectable.tsm-tag--primary {
  border: 1px solid var(--tsm-color-primary-border);
  background: var(--tsm-color-primary-bg);
}

.tsm-tag--un-selectable.tsm-tag--primary .tsm-tag-text {
  color: var(--tsm-color-primary);
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--un-selectable.tsm-tag--primary :deep(.tsm-tag-icon) > .icon {
  color: var(--tsm-color-primary);
}

.tsm-tag--un-selectable.tsm-tag--success {
  border: 1px solid var(--tsm-color-success-border);
  background: var(--tsm-color-success-bg);
}

.tsm-tag--un-selectable.tsm-tag--success .tsm-tag-text {
  color: var(--tsm-color-success);
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--un-selectable.tsm-tag--success :deep(.tsm-tag-icon) > .icon {
  color: var(--tsm-color-success);
}

.tsm-tag--un-selectable.tsm-tag--warning {
  border: 1px solid var(--tsm-color-warning-border);
  background: var(--tsm-color-warning-bg);
}

.tsm-tag--un-selectable.tsm-tag--warning .tsm-tag-text {
  color: var(--tsm-color-warning);
}

.tsm-tag--un-selectable.tsm-tag--warning :deep(.tsm-tag-icon) > .icon {
  color: var(--tsm-color-warning);
}

.tsm-tag--un-selectable.tsm-tag--error {
  border: 1px solid var(--tsm-color-danger-border);
  background: var(--tsm-color-danger-bg);
}

.tsm-tag--un-selectable.tsm-tag--error .tsm-tag-text {
  color: var(--tsm-color-danger);
  font-family: var(--tsm-font-family-regular);
}

.tsm-tag--un-selectable.tsm-tag--error :deep(.tsm-tag-icon) > .icon {
  color: var(--tsm-color-danger);
}

.tsm-tag--un-selectable.tsm-tag--borderless {
  border: none;
}
</style>
