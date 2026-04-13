/** * Avatar 头像组件 * @description 头像组件，用于显示用户头像 */
<template>
  <view class="tsm-avatar" :class="bemClass" :style="customStyle">
    <image v-if="src" class="tsm-avatar__image" :src="src" mode="aspectFill" />
    <text v-else-if="text" class="tsm-avatar__text" :style="{ color: color }">{{ text.charAt(0) }}</text>
    <text v-else class="tsm-avatar__icon" :style="{ color: color }">👤</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AvatarProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<AvatarProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('avatar', [props.shape], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f0f0f0;
}

.tsm-avatar--circle {
  border-radius: 50%;
}

.tsm-avatar--square {
  border-radius: 4px;
}

.tsm-avatar__image {
  width: 100%;
  height: 100%;
}

.tsm-avatar__text {
  font-size: 16px;
  font-weight: bold;
}

.tsm-avatar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
</style>
