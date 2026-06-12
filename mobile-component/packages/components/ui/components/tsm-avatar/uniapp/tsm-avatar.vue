<template>
  <view class="tsm-avatar" :class="bemClass" :style="wrapperStyle">
    <!-- 插槽：icon - 自定义图标内容（type="icon" 时显示） -->
    <slot v-if="props.type === 'icon'" name="icon">
      <icon-avatar-user-fill class="tsm-avatar-icon-wrapper" v-if="props.property === 'user'" />
      <icon-avatar-organization-fill class="tsm-avatar-icon-wrapper" v-else-if="props.property === 'organization'" />
      <icon-avatar-group-fill class="tsm-avatar-icon-wrapper" v-else-if="props.property === 'group'" />
      <icon-avatar-material-fill class="tsm-avatar-icon-wrapper" v-else-if="props.property === 'material'" />
    </slot>
    <text v-else-if="type === 'text'" class="tsm-avatar-text-container" :style="colorStyle">
      <!-- 插槽：text - 自定义文本内容（type="text" 时显示） -->
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
        @load="onLoaded"
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
  if (props.type === 'text') {
    const style: Record<string, any> = {};
    if (props.bgColor) {
      style.backgroundColor = props.bgColor;
    }
    if (props.borderColor) {
      style.border = `1px solid ${props.borderColor}`;
    }
    return style as CSSProperties;
  }
  return {};
});

const bemClass = computed(() => {
  const modifiers: (string | undefined)[] = [props.size, props.type];
  if (props.type === 'icon' && props.property) {
    modifiers.push(props.property);
  }
  return bem('avatar', modifiers, []);
});

const colorStyle = computed<CSSProperties>(() => (props.color ? { color: props.color } : {}));

const displayText = computed(() => {
  if (!props.text) {
    return '';
  }
  const takeLength = props.size === 'xs' ? 1 : 2;
  if (props.text.length <= takeLength) {
    return props.text;
  }
  return props.text.slice(-takeLength);
});

const showPictureFallback = computed(() => {
  if (props.type !== 'picture') {
    return false;
  }
  if (!props.src) {
    return true;
  }
  return imageStatus.value === 'error';
});

const onLoaded = () => {
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
  width: var(--tsm-avatar-size, 40px);
  height: var(--tsm-avatar-size, 40px);
  border-radius: var(--tsm-radius-full);
  box-sizing: border-box;
}

.tsm-avatar--xs {
  --tsm-avatar-size: 22px;
  --tsm-avatar-icon-size: 12px;
}

.tsm-avatar--s {
  --tsm-avatar-size: 32px;
  --tsm-avatar-icon-size: 18px;
}

.tsm-avatar--m {
  --tsm-avatar-size: 40px;
  --tsm-avatar-icon-size: 24px;
}

.tsm-avatar--l {
  --tsm-avatar-size: 48px;
  --tsm-avatar-icon-size: 28px;
}

.tsm-avatar--xl {
  --tsm-avatar-size: 56px;
  --tsm-avatar-icon-size: 36px;
}

.tsm-avatar--icon :deep(.icon) {
  width: var(--tsm-avatar-icon-size);
  height: var(--tsm-avatar-icon-size);
}

.tsm-avatar-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tsm-avatar-text-container {
  color: var(--tsm-color-primary);
  font-size: var(--tsm-font-size-text-2xl);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-font-size-2xl); /* 140% */
  overflow: hidden;
}

.tsm-avatar--xs .tsm-avatar-text-container,
.tsm-avatar--s .tsm-avatar-text-container {
  font-size: var(--tsm-font-size-text-s);
  line-height: var(--tsm-line-height-text-s);
}

.tsm-avatar--m .tsm-avatar-text-container {
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-avatar--l .tsm-avatar-text-container,
.tsm-avatar--xl .tsm-avatar-text-container {
  font-size: var(--tsm-font-size-text-2xl);
  line-height: var(--tsm-line-height-text-2xl);
}

.tsm-avatar-fallback {
  color: var(--tsm-color-text-secondary);
  font-size: var(--tsm-font-size-text-m);
  text-align: center;
}

.tsm-avatar--picture {
  background: var(--tsm-color-primary-border);
  position: relative;
}
.tsm-avatar--picture::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-primary-border);
  opacity: 0.4;
  pointer-events: none;
}

.tsm-avatar--text {
  color: var(--tsm-color-primary);
  background: var(--tsm-color-primary-border);
  position: relative;
}
.tsm-avatar--text::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-primary-active);
  opacity: 0.4;
  pointer-events: none;
}

.tsm-avatar--user {
  background: var(--tsm-color-primary-border);
  position: relative;
}
.tsm-avatar--user::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-primary-active);
  opacity: 0.4;
  pointer-events: none;
}

.tsm-avatar--organization {
  background: var(--tsm-color-violet-border);
  position: relative;
}
.tsm-avatar--organization::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-violet-active);
  opacity: 0.4;
  pointer-events: none;
}

.tsm-avatar--group {
  background: var(--tsm-color-primary-border);
  position: relative;
}
.tsm-avatar--group::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-primary-active);
  opacity: 0.4;
  pointer-events: none;
}

.tsm-avatar--material {
  background: var(--tsm-color-primary-border);
  position: relative;
}
.tsm-avatar--material::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px var(--tsm-color-primary-active);
  opacity: 0.4;
  pointer-events: none;
}
</style>
