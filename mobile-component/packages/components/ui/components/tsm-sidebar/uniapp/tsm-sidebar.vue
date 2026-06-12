/** * Sidebar 侧边栏组件 * @description 侧边栏组件，用于显示侧边导航选项 */
<template>
  <view class="tsm-sidebar">
    <view class="tsm-sidebar__menu">
      <view
        class="tsm-sidebar__menu-item"
        :class="{
          'tsm-sidebar__menu-item-active': activeMenuIndex === index,
          'tsm-sidebar__menu-item-pre': activeMenuIndex === index + 1,
          'tsm-sidebar__menu-item-next': activeMenuIndex === index - 1,
          'tsn-sidebar__menu-item-disabled': item.disabled,
        }"
        v-for="(item, index) in menus"
        :key="index"
        @click="handleMenuItemClick(item, index)"
      >
        <tsm-badge
          :value="item[badge.prop || 'num']"
          v-if="badge"
          :is-dot="badge.isDot"
          shape="circle"
          class="tsm-sidebar__menu-item-num"
        >
        </tsm-badge>
        <view v-if="item.icon" :class="{ 'tsm-sidebar__menu-item-icon': activeMenuIndex !== index }">
          <component :is="item.icon" :size="iconSize" />
        </view>
        <view class="tsm-sidebar__menu-item-label">
          {{ item.label }}
        </view>
      </view>
    </view>
    <view class="tsm-sidebar__content">
      <slot name="content" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SidebarMenuItem, SidebarProps } from './props';
import { defaultProps, iconSize } from './props';

const props = withDefaults(defineProps<SidebarProps>(), defaultProps);

const emit = defineEmits<{
  'item-click': [item: SidebarMenuItem, index: number];
}>();

// 当前点击的菜单项
const activeMenuIndex = ref<number>(0);
// 点击菜单项
const handleMenuItemClick = (item: SidebarMenuItem, index: number) => {
  activeMenuIndex.value = index;
  emit('item-click', item, index);
};
</script>

<style scoped lang="scss">
.tsm-sidebar {
  height: 100%;
  width: 100%;
  display: flex;
}
.tsm-sidebar__menu {
  width: 88px;
  overflow-y: scroll;
  margin-right: var(--tsm-spacing-xl);
}
.tsm-sidebar__menu-item {
  display: flex;
  width: 100%;
  position: relative;
  min-height: 48px;
  max-height: 72px;
  padding: var(--tsm-spacing-xl);
  align-items: center;
  gap: var(--tsm-spacing-xs);
  box-sizing: border-box;
  color: var(--tsm-color-text-primary);
  overflow: hidden;
  background: var(--tsm-bg-color-component-light, #f5f6f8);
  /* Body/l */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
}
.tsm-sidebar__menu-item-label {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.tsm-sidebar__menu-item-num {
  position: absolute;
  top: 8px;
  right: 12px;
}
.tsm-sidebar__menu-item-pre {
  border-bottom-right-radius: 8px;
}
.tsm-sidebar__menu-item-next {
  border-top-right-radius: 8px;
}
.tsm-sidebar__menu-item-active {
  background: var(--tsm-color-bg-white);
  position: relative;
  color: var(--tsm-color-primary);

  /* Body-Semibold/l */
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-l); /* 150% */
}
.tsn-sidebar__menu-item-disabled {
  background: var(--tsm-bg-color-component-light, #f5f6f8);
  color: var(--tsm-color-text-disabled);
  pointer-events: none;
}
.tsm-sidebar__menu-item-active:before {
  content: '';
  position: absolute;
  left: 0;
  top: calc(50% - 7px);
  width: 3px;
  height: 14px;
  background: var(--tsm-color-primary);
  border-radius: 1.5px;
}
.tsm-sidebar__content {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
  background: red;
}
.tsm-sidebar__menu-item-icon {
  color: var(--tsm-color-text-secondary);
}
</style>
