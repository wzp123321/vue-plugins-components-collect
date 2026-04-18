/** * TabbarItem 底部导航项组件 * @description 底部导航项组件，需要配合tsm-tabbar使用 */
<template>
  <view class="tsm-tabbar-item" :class="bemClass" :style="customStyle" @tap="onClick">
    <view class="tsm-tabbar-item-icon">
      <img class="tsm-tabbar-item-icon-img" :src="icon" v-if="typeof icon === 'string'" />
      <component class="tsm-tabbar-item-icon-img" :is="icon" v-else-if="icon !== undefined"></component>
      <!-- 角标 -->
      <view v-if="badge > 0" class="tsm-tabbar-item-badge" :class="`tsm-tabbar-item-badge--${badgeType}`">
        <text v-if="badgeType === 'circle' && badge <= 99" class="tsm-tabbar-item-badge-text">{{ badge }}</text>
        <text v-else-if="badgeType === 'circle'" class="tsm-tabbar-item-badge-text">99+</text>
      </view>
    </view>
    <text class="tsm-tabbar-item-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { type Ref, ref, computed, inject, onMounted, type Component } from 'vue';
import type { TabbarItemProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TabbarItemProps>(), defaultProps);
const emit = defineEmits<{
  click: [];
}>();

// 从父组件获取上下文
const tabbarContext = inject<{
  currentIndex: Ref<number>;
  onItemClick: (index: number) => void;
  setItemIndex: (itemIndex: Ref<number>) => void;
  registerItem: (item: { text: string; icon: string | Component | undefined }) => void;
} | null>('tabbarContext', null);

// 项索引（由父组件设置）
const itemIndex = ref(0);

// 监听项挂载
onMounted(() => {
  // 这里可以通过父组件的逻辑来设置itemIndex
  tabbarContext?.setItemIndex(itemIndex);
  // 注册item信息
  tabbarContext?.registerItem({ text: props.text, icon: props.icon });
});

// 是否选中
const isActive = computed(() => {
  return tabbarContext?.currentIndex.value === itemIndex.value;
});

// 点击事件
const onClick = () => {
  tabbarContext?.onItemClick(itemIndex.value);
  emit('click');
};

const bemClass = computed(() => {
  return bem('tabbar-item', [isActive.value ? 'active' : ''], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-tabbar-item {
  flex: 1;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 3px;
  padding: 0 var(--tsm-spacing-2xl);

  .tsm-tabbar-item-icon {
    position: relative;
    :deep(.tsm-tabbar-item-icon-img) {
      width: 18px;
      height: 18px;
      color: var(--tsm-color-text-secondary) !important;
    }
  }

  .tsm-tabbar-item-text {
    color: var(--tsm-color-text-secondary);
    text-align: center;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-2xs);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-2xs); /* 160% */
  }

  .tsm-tabbar-item-badge {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--tsm-radius-full);
    border: 1px solid var(--tsm-color-text-white);
    background: var(--tsm-color-danger);
  }
  .tsm-tabbar-item-badge--dot {
    top: -4px;
    right: -14px;
    min-width: 8px;
    height: 8px;
    padding: 0;
  }
  .tsm-tabbar-item-badge--circle {
    top: -6px;
    right: -15px;
    height: 14px;
    min-width: 14px;
    padding: 0 var(--tsm-spacing-2xs);
  }
  .tsm-tabbar-item-badge-text {
    font-size: 10px;
    line-height: 1;
    color: white;
    font-weight: 500;
  }
}

.tsm-tabbar-item--active {
  .tsm-tabbar-item-text {
    color: var(--tsm-color-primary);
  }
  .tsm-tabbar-item-icon {
    :deep(.tsm-tabbar-item-icon-img) {
      color: var(--tsm-color-primary) !important;
    }
  }
}
</style>
