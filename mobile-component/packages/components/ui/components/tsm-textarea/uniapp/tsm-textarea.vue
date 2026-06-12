/** * Textarea 多行输入框组件 * @description 多行输入框组件，用于长文本输入 */
<template>
  <view
    class="tsm-textarea"
    :class="[
      customClass,
      {
        'tsm-textarea--disabled': isDisabled,
        'tsm-textarea--readonly': isReadonly,
        'tsm-textarea--focus': isFocused,
        'tsm-textarea--error': error,
      },
    ]"
    :style="textareaStyleObj"
  >
    <textarea
      v-if="!isReadonly"
      class="tsm-textarea__field"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :maxlength="-1"
      :focus="autofocus"
      :auto-height="rows === 1"
      :placeholder-style="placeholderStyle"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onConfirm"
    />
    <view v-else class="tsm-textarea__readonly-content">
      <view class="tsm-textarea__readonly-wrap">
        <view class="tsm-textarea__readonly-text" :class="{ 'is-expanded': isExpanded }">
          <template v-if="!isExpanded">
            <text>{{ displayText }}</text
            ><tsm-button
              v-if="showExpandBtn"
              type="link"
              size="m"
              theme="primary"
              custom-class="tsm-textarea__expand-btn"
              @tap="toggleExpand"
              >展开</tsm-button
            >
          </template>
          <template v-else>
            <text>{{ inputValue }}</text
            ><tsm-button
              v-if="showExpandBtn"
              type="link"
              size="m"
              theme="primary"
              custom-class="tsm-textarea__expand-btn tsm-textarea__expand-btn-pull"
              @tap="toggleExpand"
              >收起</tsm-button
            >
          </template>
        </view>

        <!-- 隐藏测量节点 -->
        <view class="tsm-textarea__line-height-measure" :style="{ width: clampMeasureWidth }">中</view>
        <view class="tsm-textarea__clamp-measure" :style="{ width: clampMeasureWidth }">{{ measureText }}</view>
      </view>
    </view>
    <view class="tsm-textarea__footer">
      <view class="tsm-textarea__footer-left">
        <slot name="footer-left" />
      </view>
      <view
        v-if="showCount && maxlength > 0"
        class="tsm-textarea__count"
        :class="{ 'tsm-textarea__count--overflow': inputValue.length > maxlength }"
      >
        {{ inputValue.length }}/{{ maxlength }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, nextTick, onMounted, getCurrentInstance } from 'vue';
import type { TextareaProps } from './props';
import { defaultProps } from './props';
import type { FormItemContext } from '../../tsm-form-item/uniapp/type';
import { addStyle } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TextareaProps>(), defaultProps);
const instance = getCurrentInstance();

const emit = defineEmits<{
  input: [value: string];
  focus: [event: any];
  blur: [event: any];
  confirm: [event: any];
  change: [value: string];
  'update:value': [value: string];
}>();

const inputValue = ref(props.value);
const isFocused = ref(false);
const isExpanded = ref(false);
const showExpandBtn = ref(false);
const displayText = ref('');
const measureText = ref('');
const clampMeasureWidth = ref('100%');

// Inject FormItem 上下文
const formItemContext = inject<FormItemContext | null>('formItemContext', null);

// 只读状态
const isReadonly = computed(() => props.readonly || !!formItemContext?.readonly);

// 禁用状态
const isDisabled = computed(() => props.disabled);

watch(
  () => props.value,
  newVal => {
    inputValue.value = newVal;
  }
);

const textareaStyleObj = computed(() => {
  const style: Record<string, any> = { ...props.customStyle };
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  if (isReadonly.value && isExpanded.value) {
    style.height = 'auto';
  }
  return addStyle(style);
});

const placeholderStyle = computed(() => {
  return 'overflow:hidden;color:var(--tsm-color-text-placeholder);text-overflow:ellipsis;white-space:nowrap;font-family:var(--tsm-font-family-regular);font-size:var(--tsm-font-size-text-l);font-style:normal;font-weight:var(--tsm-font-weight-regular);line-height:var(--tsm-line-height-text-l)';
});

const getNodeRect = (selector: string): Promise<UniApp.NodeInfo | null> => {
  return new Promise(resolve => {
    nextTick(() => {
      const query = uni.createSelectorQuery().in(instance as any);
      query.select(selector).boundingClientRect();
      query.exec((res: any) => {
        resolve(res?.[0] || null);
      });
    });
  });
};

const calcClampText = async () => {
  if (!isReadonly.value || !inputValue.value) {
    displayText.value = inputValue.value || '';
    showExpandBtn.value = false;
    return;
  }

  // 获取实际容器宽度
  const textRect = await getNodeRect('.tsm-textarea__readonly-text');
  const width = textRect?.width || 0;
  if (width <= 0) {
    // 布局还未完成，延迟重试
    setTimeout(() => calcClampText(), 100);
    return;
  }
  clampMeasureWidth.value = `${width}px`;

  // 获取 lineHeight
  const lhRect = await getNodeRect('.tsm-textarea__line-height-measure');
  const lineHeightValue = lhRect?.height || 24;
  const maxHeight = props.rows * lineHeightValue;

  // 测试完整文本高度（包含按钮）
  measureText.value = inputValue.value + '...展开';
  const fullRect = await getNodeRect('.tsm-textarea__clamp-measure');
  const fullHeight = fullRect?.height || 0;

  if (fullHeight <= maxHeight) {
    displayText.value = inputValue.value;
    showExpandBtn.value = false;
    return;
  }

  showExpandBtn.value = true;

  // 二分查找最佳截断位置（测量时把“...展开”一起算进去）
  let left = 0;
  let right = inputValue.value.length;
  let best = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    measureText.value = inputValue.value.slice(0, mid) + '...展开';
    const rect = await getNodeRect('.tsm-textarea__clamp-measure');
    const h = rect?.height || 0;
    if (h <= maxHeight) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  displayText.value = inputValue.value.slice(0, best) + '...';
};

watch(() => inputValue.value, calcClampText);
watch(isReadonly, val => {
  isExpanded.value = false;
  if (val) {
    calcClampText();
  } else {
    showExpandBtn.value = false;
    displayText.value = inputValue.value;
  }
});
onMounted(() => {
  if (isReadonly.value) {
    calcClampText();
  }
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const onInput = (e: any) => {
  if (isReadonly.value) {
    // 只读状态下恢复原值，阻止输入
    inputValue.value = props.value;
    emit('update:value', props.value);
    return;
  }
  const value = e.detail.value;
  inputValue.value = value;
  emit('update:value', value);
  emit('input', value);
  emit('change', value);
  formItemContext?.onValueChange(value);
};

const onFocus = (e: any) => {
  isFocused.value = true;
  emit('focus', e);
};

const onBlur = (e: any) => {
  isFocused.value = false;
  emit('blur', e);
  formItemContext?.onBlur();
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
  height: 100%;
  padding: var(--tsm-spacing-xl);
  box-sizing: border-box;
  border-radius: var(--tsm-radius-m);
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-white);
  box-shadow: var(--tsm-shadow-xs);
  position: relative;
  transition: border-color 0.2s;

  &--focus {
    border: 1px solid var(--tsm-color-primary-light);
    outline: 1px solid var(--tsm-color-primary-light);
  }

  &--error {
    border: 1px solid var(--tsm-color-danger-border);
    background: var(--tsm-color-bg-white);
    box-shadow: var(--tsm-shadow-xs);

    // error + focus：聚焦时加粗
    &.tsm-textarea--focus {
      border: 1px solid var(--tsm-color-danger);
      outline: 1px solid var(--tsm-color-danger);
    }
  }

  &--disabled {
    border: 1px solid var(--tsm-color-border-primary);
    background: var(--tsm-color-bg-disabled);
    box-shadow: var(--tsm-shadow-xs);

    .tsm-textarea__field {
      color: var(--tsm-color-text-disabled);
    }
  }

  &--readonly {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0;
  }
}

.tsm-textarea__readonly-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tsm-textarea__readonly-wrap {
  position: relative;
  display: block;
  width: 100%;
}

.tsm-textarea__readonly-text {
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
  color: var(--tsm-color-text-primary);
  word-break: break-all;
  width: 100%;
  display: block;
}

:deep(.tsm-textarea__expand-btn) {
  color: var(--tsm-color-primary) !important;
  padding-left: var(--tsm-spacing-xs);
}

.tsm-textarea__readonly-text.is-expanded {
  :deep(.tsm-textarea__expand-btn) {
    display: flex;
    margin-left: auto;
    margin-top: var(--tsm-spacing-xs);
    padding-left: 0;
  }
  :deep(.tsm-textarea__expand-btn-pull) {
    justify-content: flex-end;
  }
  .tsm-button {
    height: 24px;
  }
}

.tsm-textarea__line-height-measure,
.tsm-textarea__clamp-measure {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
  word-break: break-all;
}

.tsm-textarea__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--tsm-spacing-xs);
}

.tsm-textarea__footer-left {
  display: flex;
  align-items: center;
}

.tsm-textarea__count {
  font-size: var(--tsm-font-size-text-xs);
  color: var(--tsm-color-text-secondary);

  &--overflow {
    color: var(--tsm-color-danger);
  }
}
</style>
