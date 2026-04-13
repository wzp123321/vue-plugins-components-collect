/** * Search 搜索组件 * @description 搜索组件，用于搜索功能 */
<template>
  <view class="tsm-search" :class="bemClass" :style="customStyle">
    <view class="tsm-search__content">
      <icon-setting />
      <input
        class="tsm-search__input"
        :value="value"
        :placeholder="placeholder"
        confirm-type="search"
        @input="onInput"
        @confirm="onSearch"
      />
      <view v-if="clearable && value" class="tsm-search__clear" @tap="onClear">
        <icon-setting />
      </view>
    </view>
    <view v-if="showAction" class="tsm-search__action" @tap="onSearch">
      <text class="tsm-search__action__text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<SearchProps>(), defaultProps);

const emit = defineEmits<{
  search: [value: string];
  input: [value: string];
  clear: [];
  'update:value': [value: string];
}>();

const bemClass = computed(() => {
  return bem('search', [], [], props.customClass);
});

const onInput = (e: any) => {
  const value = e.detail.value;
  emit('update:value', value);
  emit('input', value);
};

const onSearch = () => {
  emit('search', props.value);
};

const onClear = () => {
  emit('update:value', '');
  emit('input', '');
  emit('clear');
};
</script>

<style scoped lang="scss">
.tsm-search {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f7f8fa;
}

.tsm-search__content {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 0 12px;
  height: 32px;
}

.tsm-search__icon {
  margin-right: 8px;
}

.tsm-search__input {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.tsm-search__clear {
  margin-left: 8px;
}

.tsm-search__action {
  margin-left: 8px;
}

.tsm-search__action__text {
  font-size: 14px;
  color: #2979ff;
}
</style>
