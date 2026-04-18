/** * Tabbar 底部导航组件 * @description 底部导航组件，用于页面底部导航切换 */
<template>
  <view class="tsm-tabbar" :class="bemClass" :style="customStyle">
    <!-- 显示前4个tabbar-item -->
    <slot name="default"></slot>
    <!-- 更多按钮 -->
    <!-- <tsm-tabbar-item text="更多" v-if="totalItems > 5" :icon="IconMore" @click="showMoreMenu = true" /> -->
  </view>
</template>

<script setup lang="ts">
import { type Ref, computed, ref, provide, onMounted } from 'vue';
import type { TabbarProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';
const props = withDefaults(defineProps<TabbarProps>(), defaultProps);

const emit = defineEmits<{
  change: [index: number];
  'update:modelValue': [value: number];
}>();

// 内部选中索引
const currentIndex = computed({
  get: () => {
    return props.modelValue;
  },
  set: (index: number) => {
    emit('update:modelValue', index);
  },
});

// 总项数
const totalItems = ref(0);
// 存储tabbar-item的信息
const tabbarItems = ref<Array<{ text: string; icon: string }>>([]);

// 提供上下文给子组件
provide('tabbarContext', {
  currentIndex,
  tabbarItems,
  onItemClick: (index: number) => {
    currentIndex.value = index;
    emit('change', index);
  },
  setItemIndex: (itemIndex: Ref<number>) => {
    itemIndex.value = totalItems.value++;
  },
  registerItem: (item: { text: string; icon: string }) => {
    tabbarItems.value.push(item);
  },
});

const bemClass = computed(() => {
  return bem(
    'tabbar',
    [props.fixed ? 'fixed' : '', props.bgColor === 'capsule' ? 'capsule' : ''],
    [],
    props.customClass
  );
});
</script>

<style scoped lang="scss">
.tsm-tabbar {
  display: flex;
  padding: var(--tsm-spacing-xs);
  justify-content: center;
  align-items: center;
  gap: var(--tsm-spacing-m);
  background-color: var(--tsm-color-bg-white);
  border-top: 1px solid var(--tsm-color-border-secondary);
  position: relative;
}

.tsm-tabbar--fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.tsm-tabbar--capsule {
  border-radius: 296px;
  background:
    linear-gradient(0deg, #f7f7f7 0%, #f7f7f7 100%), linear-gradient(0deg, #ddd 0%, #ddd 100%),
    rgba(255, 255, 255, 0.65);
  background-blend-mode: darken, color-burn, normal;
  box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.12);
  :deep(.tsm-tabbar-item--active) {
    border-radius: var(--tsm-radius-full);
    background: var(--tsm-color-bg-secondary);
    mix-blend-mode: plus-darker;
  }
}
</style>
