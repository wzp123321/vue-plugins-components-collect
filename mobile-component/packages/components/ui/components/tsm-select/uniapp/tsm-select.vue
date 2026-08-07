<template>
  <view class="tsm-select" :class="[bemClass, customClass]" :style="customStyle">
    <view
      v-if="!isReadonly"
      class="tsm-select__wrapper"
      :class="{
        'tsm-select__wrapper--focused': isFocused && !disabled,
        'tsm-select__wrapper--disabled': disabled,
      }"
      @tap="togglePopup"
    >
      <!-- ① prefix 插槽 -->
      <view v-if="slots.prefix" class="tsm-select__prefix">
        <slot name="prefix" />
      </view>

      <!-- ② selection 展示区 -->
      <view class="tsm-select__selection">
        <!-- 多选：tag 列表 -->
        <template v-if="multiple && showTagList.length > 0">
          <view v-for="item in showTagList" :key="item.value" class="tsm-select__tag-wrapper" @tap.stop>
            <slot name="tag" :item="item">
              <tsm-tag
                :closable="!disabled && !item.disabled"
                :size="size === 'default' ? 'medium' : size"
                shape="square"
                :text="item.label"
                @close="removeTag(item)"
              />
            </slot>
          </view>

          <!-- 折叠标签 +N -->
          <view
            v-if="collapseTags && collapseTagList.length > 0"
            class="tsm-select__tag-wrapper"
            @tap.stop="togglePopup"
          >
            <tsm-tag
              :closable="false"
              :size="size === 'default' ? 'medium' : size"
              shape="square"
              :text="`+ ${collapseTagList.length}`"
            />
          </view>
        </template>

        <!-- 单选：显示选中项 label -->
        <template v-else-if="!multiple && selectedItem">
          <slot name="label" :item="selectedItem">
            <text class="tsm-select__selected-text">{{ selectedItem.label }}</text>
          </slot>
        </template>

        <!-- placeholder -->
        <text v-else class="tsm-select__placeholder">
          <slot name="placeholder">{{ placeholder }}</slot>
        </text>
      </view>

      <!-- ③ suffix 图标区 -->
      <view class="tsm-select__suffix" @tap.stop>
        <!-- 清除按钮 -->
        <icon-circle-close-fill v-if="showClose" class="tsm-select__icon tsm-select__icon--clear" @tap="handleClear" />
        <!-- 下拉箭头 -->
        <icon-down v-else class="tsm-select__icon" :class="{ 'tsm-select__icon--reverse': isFocused }" />
      </view>
    </view>

    <!-- readonly 只读展示 -->
    <select-readonly v-if="isReadonly" :text="readonlyDisplayText" />

    <!-- Part2：弹出选择面板 -->
    <select-popup
      :show="isFocused"
      :title="title"
      :options="options"
      :modelValue="modelValue"
      :multiple="multiple"
      :multipleLimit="multipleLimit"
      :filterable="filterable"
      :remote="remote"
      :loading="loading"
      :showFooter="multiple"
      :filterMethod="filterMethod"
      :searchPlaceholder="searchPlaceholder"
      :confirmText="confirmText"
      :pagination="pagination"
      :paginationLoading="paginationLoading"
      :finished="finished"
      :finishedText="finishedText"
      :hasSubText="hasSubText"
      @update:show="handlePopupShowChange"
      @select="handleOptionSelect"
      @remove="handleOptionRemove"
      @confirm="handlePopupConfirm"
      @search="handlePopupSearch"
      @load-more="handleLoadMore"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, inject, watch, useSlots } from 'vue';
import type { TsmSelectProps, SelectOption } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';
import SelectPopup from './select-popup.vue';
import SelectReadonly from './select-readonly.vue';

/**
 * @slot prefix 输入框前缀区域，位于选中值展示区之前
 * @slot tag 自定义多选 tag 渲染，作用域参数 { item: SelectOption }
 * @slot label 自定义单选选中值展示，作用域参数 { item: SelectOption }
 * @slot placeholder 自定义占位文本
 */
// Slots
const slots = useSlots();

// Props 定义
const props = withDefaults(defineProps<TsmSelectProps>(), defaultProps);

// 事件定义
const emit = defineEmits<{
  /** v-model 双向绑定值变更 */
  (e: 'update:modelValue', value: string | number | (string | number)[]): void;
  /** 选中值变更，选中/取消/tag移除/清空时触发 */
  (e: 'change', value: string | number | (string | number)[]): void;
  /** 点击清除按钮时触发 */
  (e: 'clear'): void;
  /** popup 面板打开/关闭时触发 */
  (e: 'visible-change', visible: boolean): void;
  /** 多选模式下移除 tag 时触发 */
  (e: 'remove-tag', value: string | number): void;
  /** 搜索关键词变更时触发 */
  (e: 'search', keyword: string): void;
  /** 分页模式下滚动触底时触发 */
  (e: 'load-more'): void;
}>();

// Inject FormItem 上下文（可选，兼容表单）
const formItemContext = inject<any>('formItemContext', null);

// ==================== 状态 ====================

/** popup 展开/聚焦状态 */
const isFocused = ref(false);

/** 已选中的选项列表（显式维护，不依赖 options 计算，避免远程搜索干扰） */
const selectedItems = ref<SelectOption[]>([]);

/** 同步 selectedItems：根据 modelValue 和 options 更新选项列表 */
const syncSelectedItems = (): void => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : [];
    selectedItems.value = values.map(v => {
      const existing = selectedItems.value.find(item => item.value === v);
      // 已有真实 label（非 value 回退），保留不更新
      if (existing && existing.label !== String(v)) return existing;
      const fromOptions = props.options.find(opt => opt.value === v);
      if (fromOptions) return { label: fromOptions.label, value: fromOptions.value, disabled: fromOptions.disabled };
      return existing || { label: String(v), value: v };
    });
  } else {
    const v = props.modelValue as string | number;
    if (v === '' || v === undefined || v === null) {
      selectedItems.value = [];
      return;
    }
    const existing = selectedItems.value.find(item => item.value === v);
    // 已有真实 label（非 value 回退），保留不更新
    if (existing && existing.label !== String(v)) return;
    const fromOptions = props.options.find(opt => opt.value === v);
    if (fromOptions) {
      selectedItems.value = [{ label: fromOptions.label, value: fromOptions.value, disabled: fromOptions.disabled }];
    } else {
      selectedItems.value = existing ? [existing] : [{ label: String(v), value: v }];
    }
  }
};

// modelValue 或 options 变化时同步（options 延迟到达时自动修正 label）
watch([() => props.modelValue, () => props.options], syncSelectedItems, { immediate: true });

/** 是否只读（prop 或 form 上下文覆盖） */
const isReadonly = computed(() => {
  return props.readonly || formItemContext?.readonly;
});

/** 单选时的选中项 */
const selectedItem = computed((): SelectOption | null => {
  if (props.multiple) return null;
  return selectedItems.value[0] || null;
});

/** 是否有选中值 */
const hasValue = computed((): boolean => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : [];
    return values.length > 0;
  }
  return props.modelValue !== '' && props.modelValue !== undefined && props.modelValue !== null;
});

/** 是否显示清除按钮 */
const showClose = computed((): boolean => {
  return props.clearable && hasValue.value && !props.disabled && !isReadonly.value;
});

/** 可见的 tag 列表（collapseTags 控制截取） */
const showTagList = computed((): SelectOption[] => {
  if (!props.multiple) return [];
  const items = selectedItems.value;
  if (props.collapseTags && items.length > props.maxCollapseTags) {
    return items.slice(0, props.maxCollapseTags);
  }
  return items;
});

/** 折叠溢出的 tag 列表 */
const collapseTagList = computed((): SelectOption[] => {
  if (!props.multiple || !props.collapseTags) return [];
  const items = selectedItems.value;
  if (items.length > props.maxCollapseTags) {
    return items.slice(props.maxCollapseTags);
  }
  return [];
});

/** readonly 态展示文本 */
const readonlyDisplayText = computed((): string => {
  if (props.multiple) {
    return selectedItems.value.map(item => item.label).join('、');
  }
  return selectedItem.value?.label || '';
});

/** BEM 类名组合 */
const bemClass = computed((): string => {
  const { size, disabled } = props;
  return bem(
    'select',
    [size],
    [
      ['disabled', disabled],
      ['multiple', props.multiple && hasValue.value],
      ['readonly', isReadonly.value],
    ],
    ''
  );
});

// ==================== 方法 ====================

/** 切换 popup 显隐 */
const togglePopup = (): void => {
  if (props.disabled || isReadonly.value) return;
  isFocused.value = true;
  emit('visible-change', true);
};

/** 通知表单值变更（触发表单验证） */
const notifyFormChange = (value?: string | number | (string | number)[]): void => {
  formItemContext?.onValueChange(value ?? props.modelValue);
};

/** 通知表单 blur 事件 */
const notifyFormBlur = (): void => {
  if (formItemContext) {
    formItemContext.onBlur(props.modelValue);
  }
};

// 监听 popup 关闭（blur 事件）
const handlePopupShowChange = (show: boolean): void => {
  isFocused.value = show;
  if (!show) {
    notifyFormBlur();
  }
};

/** 清除选中值 */
const handleClear = (): void => {
  if (props.disabled || isReadonly.value) return;
  const emptyValue: string | number | (string | number)[] = props.multiple ? [] : '';
  emit('update:modelValue', emptyValue);
  emit('change', emptyValue);
  emit('clear');
  notifyFormChange(emptyValue);
};

/** 移除单个 tag */
const removeTag = (item: SelectOption): void => {
  if (props.disabled || isReadonly.value || !props.multiple) return;
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const newValues = currentValues.filter(v => v !== item.value);
  emit('update:modelValue', newValues);
  emit('change', newValues);
  emit('remove-tag', item.value);
  notifyFormChange(newValues);
};

// ==================== Popup 事件处理 ====================

/** 选项选中 */
const handleOptionSelect = (value: string | number): void => {
  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    if (props.multipleLimit > 0 && currentValues.length >= props.multipleLimit) return;
    const newValues = [...currentValues, value];
    emit('update:modelValue', newValues);
    emit('change', newValues);
    notifyFormChange(newValues);
  } else {
    emit('update:modelValue', value);
    emit('change', value);
    notifyFormChange(value);
    isFocused.value = false;
  }
};

/** 多选移除选项 */
const handleOptionRemove = (value: string | number): void => {
  if (!props.multiple) return;
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const newValues = currentValues.filter(v => v !== value);
  emit('update:modelValue', newValues);
  emit('change', newValues);
  notifyFormChange(newValues);
};
/** Popup 确认（多选 Footer） */
const handlePopupConfirm = (): void => {
  isFocused.value = false;
};

/** Popup 搜索 */
const handlePopupSearch = (keyword: string): void => {
  if (props.remote && props.remoteMethod) {
    props.remoteMethod(keyword);
  }
  emit('search', keyword);
};

/** 分页加载更多 */
const handleLoadMore = (): void => {
  emit('load-more');
};

defineExpose({
  setFocused: (focused: boolean): void => {
    if (props.disabled || isReadonly.value) return;
    isFocused.value = focused;
  },
  isFocused,
});
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

// ==================== 根容器 ====================

.tsm-select {
  position: relative;
  display: inline-flex;
  width: 100%;
}

// ==================== Wrapper（输入框外观）====================

.tsm-select__wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--tsm-spacing-m);
  min-height: 40px;
  width: 100%;
  padding-left: var(--tsm-spacing-xl);
  padding-right: var(--tsm-spacing-m);
  padding-top: var(--tsm-spacing-m);
  padding-bottom: var(--tsm-spacing-m);
  background-color: var(--tsm-color-bg-white);
  border: 1px solid var(--tsm-color-border-primary);
  border-radius: var(--tsm-radius-m);
  box-shadow: 0 1px 2px 0 var(--tsm-shadow-xs);
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

// ==================== Wrapper 状态 ====================

.tsm-select__wrapper--focused {
  border: 2px solid var(--tsm-color-primary);
  padding-left: calc(var(--tsm-spacing-xl) - 1px);
  padding-right: calc(var(--tsm-spacing-m) - 1px);
  padding-top: calc(var(--tsm-spacing-m) - 1px);
  padding-bottom: calc(var(--tsm-spacing-m) - 1px);
}

.tsm-select__wrapper--disabled {
  background-color: var(--tsm-color-bg-disabled);
  cursor: not-allowed;
}

// ==================== Prefix ====================

.tsm-select__prefix {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// ==================== Selection 展示区 ====================

.tsm-select__selection {
  display: flex;
  flex: 1 0 0;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tsm-spacing-m);
  min-width: 0;
}

// ==================== Placeholder ====================

.tsm-select__placeholder {
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
  color: var(--tsm-color-text-placeholder);
  word-break: break-word;
}

// ==================== 单选选中文本 ====================

.tsm-select__selected-text {
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
  color: var(--tsm-color-text-primary);
  word-break: break-word;
}

// ==================== Tag Wrapper ====================

.tsm-select__tag-wrapper {
  display: inline-flex;
  flex-shrink: 0;
}

// ==================== Suffix 图标区 ====================

.tsm-select__suffix {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// ==================== 图标 ====================

.tsm-select__icon {
  width: 20px;
  height: 20px;
  color: var(--tsm-color-text-quaternary);
  transition: transform 0.2s ease;
}

.tsm-select__icon--reverse {
  transform: rotate(180deg);
  color: var(--tsm-color-primary);
}

.tsm-select__icon--clear {
  color: var(--tsm-color-text-quaternary);
}

// ==================== Size: small ====================

.tsm-select--small .tsm-select__wrapper {
  min-height: 32px;
  padding-top: var(--tsm-spacing-xs);
  padding-bottom: var(--tsm-spacing-xs);
}

.tsm-select--small .tsm-select__wrapper--focused {
  padding-top: calc(var(--tsm-spacing-xs) - 1px);
  padding-bottom: calc(var(--tsm-spacing-xs) - 1px);
}

.tsm-select--small .tsm-select__placeholder,
.tsm-select--small .tsm-select__selected-text {
  font-size: var(--tsm-font-size-text-m);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-select--small .tsm-select__icon {
  width: 16px;
  height: 16px;
}

// ==================== Disabled ====================

.tsm-select--disabled .tsm-select__placeholder {
  color: var(--tsm-color-text-disabled);
}

.tsm-select--disabled .tsm-select__icon {
  color: var(--tsm-color-text-disabled);
}
</style>
