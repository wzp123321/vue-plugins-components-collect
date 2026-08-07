<!-- Option 选项行 * @description tsm-select 内部子组件，用于弹出面板中的选项展示 -->
<template>
  <view
    class="tsm-select-option"
    :class="{
      'tsm-select-option--selected': selected,
      'tsm-select-option--disabled': option.disabled || disabled,
    }"
    @tap="handleClick"
  >
    <view class="tsm-select-option__content">
      <view class="tsm-select-option__text">
        <view class="tsm-select-option__label">
          <template v-if="query && query.length > 0">
            <text
              v-for="(part, index) in highlightedParts"
              :key="index"
              :class="part.match ? 'tsm-select-option__label--highlight' : ''"
            >
              {{ part.text }}
            </text>
          </template>
          <text v-else class="tsm-select-ellipsis">{{ option.label }}</text>
        </view>
        <view v-if="hasSubText" class="tsm-select-option__description">
          <text v-if="option.subText" class="tsm-select-ellipsis">{{ option.subText }}</text>
          <text v-else class="tsm-select-option__description--empty">-</text>
        </view>
      </view>
    </view>
    <view v-if="selected" class="tsm-select-option__check">
      <icon-check-medium class="tsm-select-option__check-icon" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SelectOption } from './props';

interface OptionProps {
  option: SelectOption;
  selected: boolean;
  disabled?: boolean;
  query?: string;
  hasSubText?: boolean;
}

const props = withDefaults(defineProps<OptionProps>(), {
  disabled: false,
  query: '',
  hasSubText: false,
});

const emit = defineEmits<{
  click: [option: SelectOption];
}>();

interface HighlightPart {
  text: string;
  match: boolean;
}

/** 根据 query 拆分 label 为匹配/非匹配片段 */
const highlightedParts = computed((): HighlightPart[] => {
  const query = props.query.trim();
  if (!query) return [{ text: props.option.label, match: false }];

  const label = props.option.label;
  const parts: HighlightPart[] = [];
  let remaining = label;

  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) {
      parts.push({ text: remaining, match: false });
      break;
    }
    if (idx > 0) {
      parts.push({ text: remaining.slice(0, idx), match: false });
    }
    parts.push({ text: remaining.slice(idx, idx + query.length), match: true });
    remaining = remaining.slice(idx + query.length);
  }

  return parts.length > 0 ? parts : [{ text: props.option.label, match: false }];
});

const handleClick = (): void => {
  if (props.option.disabled || props.disabled) return;
  emit('click', props.option);
};
</script>

<style scoped lang="scss">
.tsm-select-option {
  min-height: 62px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tsm-select-option__content {
  display: flex;
  flex: 1 0 0;
  flex-direction: row;
  align-items: center;
  gap: var(--tsm-spacing-m);
  min-width: 0;
}

.tsm-select-option__text {
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  min-width: 0;
}

.tsm-select-option__label {
  display: flex;
  min-width: 0;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
  color: var(--tsm-color-text-primary);
}

.tsm-select-option__description {
  display: flex;
  min-width: 0;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m);
  color: var(--tsm-color-text-secondary);
}

.tsm-select-option__description--empty {
  color: var(--tsm-color-text-quaternary);
}

.tsm-select-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tsm-select-option__label--highlight {
  color: var(--tsm-color-primary);
}

.tsm-select-option__check {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: var(--tsm-spacing-m);
}

.tsm-select-option__check-icon {
  width: 16px;
  height: 16px;
  color: var(--tsm-color-primary);
}

// ==================== 禁用态 ====================

.tsm-select-option--disabled {
  cursor: not-allowed;
}

.tsm-select-option--disabled .tsm-select-option__label {
  color: var(--tsm-color-text-disabled);
}

.tsm-select-option--disabled .tsm-select-option__description {
  color: var(--tsm-color-text-disabled);
}

.tsm-select-option--disabled .tsm-select-option__label--highlight {
  color: var(--tsm-color-text-disabled);
}
</style>
