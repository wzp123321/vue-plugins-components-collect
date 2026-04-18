/** * Avatar 头像组件 * @description 头像组件，用于显示用户头像 */
<template>
  <view class="tsm-avatar" :class="bemClass" :style="wrapperStyle">
    <view v-if="type === 'icon'" class="tsm-avatar-icon-container">
      <slot name="icon"></slot>
    </view>
    <text v-else-if="type === 'text'" class="tsm-avatar-text-container" :style="colorStyle">
      <slot name="text">{{ displayText }}</slot>
    </text>
    <template v-else>
      <image
        v-if="src"
        v-show="imageStatus !== 'error'"
        class="tsm-avatar-image"
        :src="src"
        mode="aspectFill"
        :style="{ opacity: imageStatus === 'loaded' ? 1 : 0 }"
        @load="onImageLoad"
        @error="onImageError"
      />
      <text v-if="showPictureFallback" class="tsm-avatar-fallback">加载失败</text>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue';
import type { AvatarProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<AvatarProps>(), defaultProps);

const imageStatus = ref<'loading' | 'loaded' | 'error'>('loading');

const wrapperStyle = computed<CSSProperties>(() => {
  if (props.type === 'picture') {
    const style: Record<string, any> = {
      ...props.customStyle,
      backgroundColor: 'transparent',
      border: 'none',
    };
    return style as CSSProperties;
  }

  const style: Record<string, any> = {
    backgroundColor: props.bgColor,
    border: `1px solid ${props.borderColor}`,
    ...props.customStyle,
  };
  return style as CSSProperties;
});

const bemClass = computed(() => {
  return bem('avatar', [props.size, props.type], [], props.customClass);
});

const colorStyle = computed<CSSProperties>(() => {
  return props.color ? { color: props.color } : {};
});

const displayText = computed(() => {
  if (!props.text) return '';
  const takeLength = props.size === 'xs' ? 1 : 2;
  if (props.text.length <= takeLength) return props.text;
  return props.text.slice(-takeLength);
});

const showPictureFallback = computed(() => {
  if (props.type !== 'picture') return false;
  if (!props.src) return true;
  return imageStatus.value === 'error';
});

const onImageLoad = () => {
  imageStatus.value = 'loaded';
};

const onImageError = () => {
  imageStatus.value = 'error';
};

watch(
  () => [props.type, props.src] as const,
  ([type, src]) => {
    if (type === 'picture' && src) {
      imageStatus.value = 'loading';
      return;
    }
    imageStatus.value = 'loaded';
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.tsm-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f0f0f0;
  width: var(--tsm-avatar-size, 40px);
  height: var(--tsm-avatar-size, 40px);
  border-radius: var(--tsm-radius-full);
  box-sizing: border-box;

  &--xs {
    --tsm-avatar-size: 22px;
    --tsm-avatar-icon-size: 12px;
  }

  &--s {
    --tsm-avatar-size: 32px;
    --tsm-avatar-icon-size: 18px;
  }

  &--m {
    --tsm-avatar-size: 40px;
    --tsm-avatar-icon-size: 24px;
  }

  &--l {
    --tsm-avatar-size: 48px;
    --tsm-avatar-icon-size: 28px;
  }

  &--xl {
    --tsm-avatar-size: 56px;
    --tsm-avatar-icon-size: 36px;
  }

  &-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tsm-avatar-icon-size, 24px);
    height: var(--tsm-avatar-icon-size, 24px);
    font-size: var(--tsm-avatar-icon-size, 24px);
    line-height: 1;
    flex: 0 0 auto;
  }

  &-image {
    width: 100%;
    height: 100%;
  }

  &-text-container {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    text-align: center;
    font-style: normal;
    font-weight: var(--tsm-font-weight-bold);
  }

  &--xs,
  &--s {
    .tsm-avatar-text-container {
      font-size: var(--tsm-font-size-text-s);
      line-height: var(--tsm-line-height-text-s);
    }
  }

  &--m {
    .tsm-avatar-text-container {
      font-size: var(--tsm-font-size-text-l);
      line-height: var(--tsm-line-height-text-l);
    }
  }

  &--l,
  &--xl {
    .tsm-avatar-text-container {
      font-size: var(--tsm-font-size-text-2xl);
      line-height: var(--tsm-line-height-text-2xl);
    }
  }

  &-fallback {
    color: var(--tsm-color-text-secondary);
    font-size: 14px;
    text-align: center;
  }
}

:deep(.tsm-avatar-icon-container > *) {
  width: 100%;
  height: 100%;
}
</style>
