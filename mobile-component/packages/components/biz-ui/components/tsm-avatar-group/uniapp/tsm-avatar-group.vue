/** * AvatarGroup 头像组组件 * @description 头像组组件，用于显示多个头像 */
<template>
  <view class="tsm-avatar-group" :class="bemClass" :style="customStyle">
    <tsm-avatar
      v-for="(url, index) in displayUrls"
      :key="index"
      :src="url"
      :size="size"
      :shape="shape"
      :style="{ marginLeft: index > 0 ? `${gap}px` : '0' }"
    />
    <view
      v-if="showMore"
      class="tsm-avatar-group__more"
      :style="{ width: addUnit(String(size)), height: addUnit(String(size)) }"
    >
      <text>+{{ moreCount }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AvatarGroupProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<AvatarGroupProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('avatar-group', [], [], props.customClass);
});

const displayUrls = computed(() => {
  return props.urls.slice(0, props.maxCount);
});

const showMore = computed(() => {
  return props.urls.length > props.maxCount;
});

const moreCount = computed(() => {
  return props.urls.length - props.maxCount;
});
</script>

<style scoped lang="scss">
.tsm-avatar-group {
  display: flex;
  align-items: center;
}

.tsm-avatar-group__more {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  color: #909399;
}
</style>
