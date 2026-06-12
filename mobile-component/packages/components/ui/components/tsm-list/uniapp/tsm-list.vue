<template>
  <view class="tsm-list" :class="listClasses">
    <view class="tsm-list-header" v-if="groupTitle">{{ groupTitle }}</view>
    <view v-if="type === 'default' || !type || type === 'switch'">
      <view
        class="tsm-list-item tsm-list-item--default"
        :class="{ 'tsm-list-disabled': !item.disabled && type !== 'switch' }"
        @tap="type === 'switch' && !item.disabled ? null : handleItemClick(item, index)"
        v-for="(item, index) in list"
        :key="item.key || index"
      >
        <component :is="item.prefixicon" v-if="item.prefixicon" />
        <view class="content">
          <view class="top" v-if="item.title">{{ item.title }}</view>
          <view class="center">
            <view class="label">{{ item.main }}</view>
            <view class="arrow" v-if="type !== 'switch'">
              <text>{{ item.extra }}</text>
              <icon-right-medium />
            </view>
            <tsm-switch
              v-else
              v-model:checked="item.checked"
              :disabled="item.disabled"
              @change="handleSwitchChange(item, index)"
            />
          </view>
          <view class="bottom" v-if="item.description">{{ item.description }}</view>
        </view>
      </view>
    </view>
    <view v-else="type === 'person'">
      <view class="tsm-list-item--user" v-for="(item, index) in list" :key="item.key || index">
        <view class="left">
          <tsm-avatar type="picture" :src="item.avatar" />
        </view>
        <view class="right">
          <view class="label">
            <text class="name">{{ item.main }}</text>
            <tsm-tag shape="bubble" :text="item.tag" />
          </view>
          <view class="description" v-if="item.description">{{ item.description }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ListItem, ListProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function';

/**
 * @typedef {Object} ListProps - 列表组件属性
 * @property {string} type - 列表类型，决定列表项的展示形式
 * @property {string} status - 列表状态，影响列表项的交互状态
 * @property {ListItem[]} list - 列表数据，每项至少包含 label 字段
 * @property {boolean} isOthers - 是否显示其他信息（仅 type 为 default 时有效）
 */
const props = withDefaults(defineProps<ListProps>(), defaultProps);

/**
 * 事件约定：
 * - item-click：点击列表项时触发，输出 item 和 index
 * - update:list：切换开关时触发，输出更新后的 list 数组
 */
const emit = defineEmits<{
  'item-click': [item: ListItem, index: number];
  'switch-change': [item: ListItem, index: number];
  'update:list': [value: ListItem[]];
}>();

// 类集合
const listClasses = computed(() => {
  return bem('list');
});

// 点击列表项
const handleItemClick = (item: ListItem, index: number) => {
  emit('item-click', item, index);
};
// 切换开关
const handleSwitchChange = (item: ListItem, index: number) => {
  emit('update:list', [...props.list]);
  emit('switch-change', item, index);
};
</script>

<style scoped lang="scss">
.tsm-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tsm-list-item {
  padding: var(--tsm-spacing-m) var(--tsm-spacing-xl) var(--tsm-spacing-m) 0;
  border-bottom: 1px solid var(--tsm-color-border-tertiary);
}
.tsm-list-disabled:hover {
  background: var(--tsm-color-bg-tertiary);
}
.tsm-list-item .top {
  color: var(--tsm-color-text-secondary);

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}
.tsm-list-item .center {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--tsm-color-text-primary);

  /* Body/l */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l); /* 150% */
}
.tsm-list-item .bottom {
  color: var(--tsm-color-text-secondary);

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}
.tsm-list-header {
  display: flex;
  padding: var(--tsm-spacing-m) var(--tsm-spacing-xl) var(--tsm-spacing-m) 0;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  color: var(--tsm-color-text-secondary);

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}

.tsm-list-item--default {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.tsm-list-item--default .content {
  flex: 1;
}

.tsm-list-item--switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tsm-list-item--user {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  border-bottom: 1px solid var(--tsm-color-border-tertiary);
}
.tsm-list-item--user .left {
  display: flex;
  padding: var(--tsm-spacing-2xl) var(--tsm-spacing-m) var(--tsm-spacing-2xl) var(--tsm-spacing-none);
  align-items: center;
  align-self: stretch;
}
.arrow {
  display: flex;
  align-items: center;
  color: var(--tsm-color-text-secondary);

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}
.tsm-list-item--user .left .avatar {
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1/1;
  background: red;
  border-radius: var(--tsm-radius-full);
  background: var(--tsm-color-primary-border);
}

.tsm-list-item--user .right {
  display: flex;
  padding: var(--tsm-spacing-xl) var(--tsm-spacing-xl) var(--tsm-spacing-xl) var(--tsm-spacing-none);
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2px;
  flex: 1 0 0;
  align-self: stretch;
}
.tsm-list-item--user .right .label {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--tsm-spacing-xs);
  overflow: hidden;
  color: var(--tsm-color-text-primary);
  text-overflow: ellipsis;

  /* Body-Semibold/l */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-l); /* 150% */
}
.tsm-list-item--user .right .description {
  color: var(--tsm-color-text-quaternary);

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}
</style>
