/** * Search 搜索组件 * @description 搜索组件，用于搜索功能 */
<template>
  <view class="tsm-search" :class="bemClass" :style="customStyle">
    <tsm-input
      v-model.trim="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      @input="handleInput"
      @confirm="handleConfirm"
      @blur="handleBlur"
      @clear="handleClear"
      @focus="handleFocus"
    >
      <template #prefix>
        <icon-search color="var(--tsm-color-text-placeholder" />
      </template>
    </tsm-input>
    <view class="tsm-search-btn" @click="handleFilterBtnClick" v-if="showFilterBtn">
      <icon-filter color="var(--tsm-color-text-placeholder)" v-if="!filterBtnHasCondition" />
      <icon-filter-fill color="var(--tsm-color-primary)" v-else />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';
import debounce from 'lodash/debounce';

const props = withDefaults(defineProps<SearchProps>(), defaultProps);

const emit = defineEmits<{
  search: [value: string];
  input: [event: any];
  clear: [];
  confirm: [event: any];
  focus: [event: any];
  blur: [event: any];
  filterBtnClick: [];
  'update:modelValue': [value: string];
}>();

const bemClass = computed(() => {
  return bem('search', [props.shape, props.bgColor], [], props.customClass);
});
// 双向绑定的值
const inputValue = computed({
  get: () => {
    return props.modelValue;
  },
  set: newValue => {
    emit('update:modelValue', newValue);
  },
});
//搜索输入框值变化
const handleInput = (event: any) => {
  if (inputValue.value !== event.detail.value) {
    handleSearch();
  }
  inputValue.value = event.detail.value;
  emit('input', event);
};
//延迟触发search事件
const handleSearch = debounce(() => {
  emit('search', inputValue.value);
}, props.delay);
const handleConfirm = (event: any) => {
  emit('confirm', event);
};
const handleFocus = (event: any) => {
  emit('focus', event);
};
const handleBlur = (event: any) => {
  emit('blur', event);
};
const handleFilterBtnClick = () => {
  emit('filterBtnClick');
};
const handleClear = () => {
  inputValue.value = '';
  emit('clear');
};
</script>

<style scoped lang="scss">
.tsm-search {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tsm-spacing-xl);
  :deep(.tsm-input-group) {
    border: none;
    background-color: var(--tsm-color-bg-tertiary);
  }
}
.tsm-search--white {
  :deep(.tsm-input-group) {
    background-color: var(--tsm-color-bg-white);
  }
}
.tsm-search--round {
  :deep(.tsm-input-group) {
    border-radius: var(--tsm-radius-full);
  }
}
</style>
