/** * ListItem 列表项组件 * @description 列表项组件，用于显示列表项内容 */
<template>
  <view class="tsm-list-item" :class="[customClass]" :style="listItemStyle" @tap="onClick">
    <view class="tsm-list-item__content">
      <text v-if="title" class="tsm-list-item__title">{{ title }}</text>
      <text v-if="desc" class="tsm-list-item__desc">{{ desc }}</text>
      <slot />
    </view>
    <view v-if="arrow" class="tsm-list-item__arrow">
      <icon-setting />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ListItemProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * ListItem 组件 Props
 * @property {string} title - 标题
 * @property {string} desc - 描述
 * @property {boolean} arrow - 是否显示右侧箭头
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<ListItemProps>(), defaultProps);

const emit = defineEmits<{
  click: [];
}>();

const listItemStyle = computed(() => {
  return addStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ebedf0',
    ...props.customStyle,
  });
});

const onClick = () => {
  emit('click');
};
</script>

<style scoped lang="scss">
.tsm-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebedf0;
}

.tsm-list-item__content {
  flex: 1;
}

.tsm-list-item__title {
  font-size: 14px;
  color: #303133;
}

.tsm-list-item__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.tsm-list-item__arrow {
  margin-left: 8px;
}
</style>
