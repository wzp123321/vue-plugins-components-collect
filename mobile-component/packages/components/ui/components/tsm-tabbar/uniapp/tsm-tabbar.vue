/** * Tabbar 底部导航组件 * @description 底部导航组件，用于页面底部导航切换 */
<template>
  <view class="tsm-tabbar" :class="bemClass" :style="customStyle">
    <slot />
    <view v-if="safeAreaInsetBottom" class="tsm-tabbar__safe-area"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue';
import type { TabbarProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TabbarProps>(), defaultProps);

const emit = defineEmits<{
  change: [index: number];
  'update:value': [value: number | string];
}>();

const currentIndex = ref(props.value);
const childrenCount = ref(0);

watch(
  () => props.value,
  newVal => {
    currentIndex.value = newVal;
  }
);

const bemClass = computed(() => {
  return bem('tabbar', [props.fixed ? 'fixed' : '', props.borderTop ? 'border' : ''], [], props.customClass);
});

const tabbarData = computed(() => ({
  value: currentIndex.value,
  activeColor: props.activeColor,
  inactiveColor: props.inactiveColor,
}));

const updateValue = (index: number) => {
  currentIndex.value = index;
  emit('update:value', index);
  emit('change', index);
};

const addChild = (itemIndex: { value: number }) => {
  itemIndex.value = childrenCount.value;
  childrenCount.value++;
};

provide('tabbarData', tabbarData);
provide('tabbarUpdateValue', updateValue);
provide('tabbarChildren', { addChild });
</script>

<style scoped lang="scss">
.tsm-tabbar {
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: #ffffff;
}

.tsm-tabbar--fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.tsm-tabbar--border {
  border-top: 1px solid #ebedf0;
}

.tsm-tabbar__safe-area {
  height: env(safe-area-inset-bottom);
}
</style>
