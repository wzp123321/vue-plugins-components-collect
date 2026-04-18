/** * Input 输入框组件 * @description 输入框组件，用于文本输入 */
<template>
  <view class="tsm-input" :class="bemClass" :style="customStyle">
    <view class="tsm-input-group" ref="inputGroupRef">
      <!-- 前缀图标 -->
      <view class="tsm-input-prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </view>
      <!-- 输入框 -->
      <input
        class="tsm-input-field"
        :value="inputValue"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        :="$attrs"
      />
      <!-- 字数统计 -->
      <view v-if="showWordimit && maxlength > 0" class="tsm-input-wordlimit">
        {{ inputValue.length }}/{{ maxlength }}
      </view>
      <!-- 清除按钮 -->
      <icon-circle-close-fill v-if="clearable && inputValue && !disabled" class="tsm-input-clear" @tap="handleClear" />
      <!-- 后缀插槽 -->
      <view class="tsm-input-suffix" v-if="$slots.suffix">
        <slot name="suffix"></slot>
        <view v-if="disabled" class="tsm-input-suffix-overlay"></view>
      </view>
    </view>
    <view class="tsm-input-readonly" :class="readonlyExpanded">
      <view class="tsm-input-readonly-content" ref="readonlyContentRef">{{ inputValue }}</view>
      <span class="tsm-input-readonly-btn" v-if="valueIsOverflowed" @tap="isReadonlyExpanded = !isReadonlyExpanded">
        {{ isReadonlyExpanded ? '收起' : '展开' }}
      </span>
    </view>
    <!-- 提示信息 -->
    <view v-if="tips" class="tsm-input-tips">
      {{ tips }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { InputProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

// const props = withDefaults(defineProps<InputProps & { [key: string]: any }>(), defaultProps);
const props = withDefaults(defineProps<InputProps & { [key: string]: any }>(), defaultProps);
const [_value, modifiers] = defineModel();
const emit = defineEmits<{
  focus: [event: any];
  blur: [event: any];
  input: [event: any];
  clear: [];
  'update:modelValue': [value: string];
}>();
const inputGroupRef = ref<any>(null);

const focused = ref(false);
// 双向绑定的值
const inputValue = computed({
  get: () => {
    return props.modelValue;
  },
  set: newValue => {
    emit('update:modelValue', newValue);
  },
});

const bemClass = computed(() => {
  return bem(
    'input',
    [props.disabled ? 'disabled' : '', focused.value ? 'focused' : '', props.readonly ? 'readonly' : ''],
    [],
    props.customClass
  );
});

const handleInput = (event: any) => {
  if (modifiers.trim) {
    event.detail.value = event.detail.value.trim();
    let inputdom = inputGroupRef.value?.$el.querySelector('.uni-input-input');
    inputdom && (inputdom.value = event.detail.value);
  }
  inputValue.value = event.detail.value;
  emit('input', event);
};

const handleFocus = (event: any) => {
  focused.value = true;
  emit('focus', event);
};

const handleBlur = (event: any) => {
  focused.value = false;
  emit('blur', event);
};

const handleClear = () => {
  inputValue.value = '';
  emit('clear');
};

const readonlyContentRef = ref<any>(null);
const isReadonlyExpanded = ref(false);
/**只读状态下，文字是否超出容器 */
const valueIsOverflowed = ref(true);
const readonlyExpanded = computed(() => {
  return bem('input-readonly', [isReadonlyExpanded.value ? 'expanded' : ''], [], '');
});
watch(
  () => inputValue,
  () => {
    nextTick(() => {
      if (props.readonly) {
        let el = readonlyContentRef.value?.$el as HTMLElement;
        if (el.scrollWidth > el.clientWidth) {
          valueIsOverflowed.value = true;
        } else {
          valueIsOverflowed.value = false;
        }
      }
    });
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.tsm-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--tsm-spacing-xs);
  .tsm-input-group {
    height: 40px;
    display: flex;
    align-items: center;
    gap: var(--tsm-spacing-m);
    min-height: 40px;
    box-sizing: border-box;
    padding: var(--tsm-spacing-m) var(--tsm-spacing-xl);
    border-radius: var(--tsm-radius-m);
    border: 1px solid var(--tsm-color-border-primary);
    background-color: var(--tsm-color-bg-white);
    box-shadow: 0 1px 2px 0 var(--tsm-shadow-xs);
  }
  .tsm-input-prefix {
    display: flex;
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
  }
  .tsm-input-field {
    flex: 1;
    color: var(--tsm-color-text-primary);
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-l);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-l); /* 150% */
    :deep(.uni-input-placeholder) {
      color: var(--tsm-color-text-placeholder);
    }
  }
  .tsm-input-wordlimit {
    overflow: hidden;
    color: var(--tsm-color-text-quaternary);
    text-overflow: ellipsis;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-s);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-s); /* 166.667% */
  }
  .tsm-input-clear {
    display: flex;
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    :deep(> svg) {
      color: var(--tsm-color-text-placeholder) !important;
    }
  }
  .tsm-input-suffix {
    border-left: 1px solid var(--tsm-color-border-primary);
    padding-left: var(--tsm-spacing-xl);
    position: relative;
  }
  .tsm-input-tips {
    overflow: hidden;
    color: var(--tsm-color-text-secondary);
    text-overflow: ellipsis;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-s);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-xs); /* 150% */
  }
}
.tsm-input--focused {
  .tsm-input-group {
    border: 2px solid var(--tsm-color-focus-ring, #6172f3);
  }
}
.tsm-input--disabled {
  .tsm-input-group {
    background: var(--tsm-color-bg-disabled);
    pointer-events: none;
  }
  .tsm-input-field {
    color: var(--tsm-color-text-disabled);
  }
  .tsm-input-suffix-overlay {
    pointer-events: none;
    opacity: 0.6;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    background: var(--tsm-color-bg-disabled);
  }
}
.tsm-input-readonly {
  display: none;
}
.tsm-input--readonly {
  .tsm-input-group {
    display: none;
  }
  .tsm-input-readonly {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--tsm-spacing-m);
    .tsm-input-readonly-content {
      flex: 1 1 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--tsm-color-text-primary);
      font-size: var(--tsm-font-size-text-l);
      font-style: normal;
      font-weight: var(-tsm-font-weight-regular);
      line-height: var(--tsm-line-height-text-l);
    }
    .tsm-input-readonly-btn {
      color: var(--tsm-color-primary);
    }
  }
  .tsm-input-readonly--expanded {
    display: block;
    .tsm-input-readonly-content {
      display: inline;
      white-space: normal;
    }
    .tsm-input-readonly-btn {
      margin-left: var(--tsm-spacing-m);
    }
  }
}
</style>
