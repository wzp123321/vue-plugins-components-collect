/** * AvatarGroup 头像组组件 * @description 头像组组件，用于显示多个头像 */
<template>
  <view class="tsm-avatar-group" :class="bemClass" :style="customStyle">
    <tsm-avatar
      v-for="(url, index) in displayUrls"
      :key="index"
      type="picture"
      :src="url"
      :size="size"
      class="tsm-avatar-group-item"
      :style="{ zIndex: displayUrls.length - index }"
    />
    <view v-if="showMore" class="tsm-avatar-group-more" @tap="handleTap">
      <text>+{{ moreCount }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AvatarGroupProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<AvatarGroupProps>(), defaultProps);

// 对外抛出点击事件
const emit = defineEmits<{
  click: [];
}>();

const handleTap = () => {
  emit('click');
};

const bemClass = computed(() => {
  return bem('avatar-group', [props.size], [], props.customClass);
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
  --tsm-avatar-group-size: 40px;
  --tsm-avatar-group-overlap: 10px;
  display: flex;
  align-items: center;
  width: fit-content;
  border-radius: var(--tsm-radius-full);
  border: 1px solid var(--tsm-color-border-primary);
  background: var(--tsm-color-bg-white);
  box-sizing: border-box;
  padding: 2px;
  backdrop-filter: blur(10px);

  box-shadow:
    0 2px 2px 0 rgba(1, 2, 11, 0.02),
    0 1px 1px 0 rgba(1, 2, 11, 0.02);

  &-item {
    border: 2px solid var(--tsm-color-text-white);
  }

  &-item + &-item {
    margin-left: calc(var(--tsm-avatar-group-overlap) * -1);
  }

  &-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tsm-avatar-group-size);
    height: var(--tsm-avatar-group-size);
    margin-left: calc(var(--tsm-avatar-group-overlap) * -1);
    text-align: center;
    color: var(--tsm-color-text-primary);
    font-style: normal;
    font-weight: var(--tsm-font-weight-bold);
    border-radius: var(--tsm-radius-full);
    border: 1px solid var(--tsm-color-bg-white);
    background-color: var(--tsm-color-bg-tertiary);
    box-sizing: border-box;
  }

  &--xs {
    --tsm-avatar-group-size: 22px;
    --tsm-avatar-group-overlap: 6px;

    .tsm-avatar-group-more {
      font-size: var(--tsm-font-size-text-s);
      line-height: var(--tsm-line-height-text-xs); /* 150% */
    }
  }

  &--s {
    --tsm-avatar-group-size: 32px;
    --tsm-avatar-group-overlap: 8px;

    .tsm-avatar-group-more {
      font-size: var(--tsm-font-size-text-m);
      line-height: var(--tsm-line-height-text-m); /* 157.143% */
    }
  }

  &--m {
    --tsm-avatar-group-size: 40px;
    --tsm-avatar-group-overlap: 10px;

    .tsm-avatar-group-more {
      font-size: var(--tsm-font-size-text-m);
      line-height: var(--tsm-line-height-text-m); /* 157.143% */
    }
  }

  &--l {
    --tsm-avatar-group-size: 48px;
    --tsm-avatar-group-overlap: 12px;

    .tsm-avatar-group-more {
      font-size: var(--tsm-font-size-text-l);
      line-height: var(--tsm-line-height-text-l); /* 150% */
    }
  }

  &--xl {
    --tsm-avatar-group-size: 56px;
    --tsm-avatar-group-overlap: 14px;

    .tsm-avatar-group-more {
      font-size: var(--tsm-font-size-text-xl);
      line-height: var(--tsm-line-height-text-xl); /* 144.444% */
    }
  }
}
</style>
