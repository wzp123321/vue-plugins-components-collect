<template>
  <view class="tsm-avatar-group" :class="bemClass">
    <tsm-avatar
      v-for="(url, index) in displayUrls"
      :key="index"
      type="picture"
      :src="url"
      :size="size"
      class="tsm-avatar-group-item"
      :style="{ zIndex: index + 1 }"
    />
    <view v-if="showMore" class="tsm-avatar-group-more" :style="{ zIndex: displayUrls.length + 1 }" @tap="handleTap">
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
  /** 点击头像组 */
  click: [];
}>();

const handleTap = () => {
  emit('click');
};

const bemClass = computed(() => bem('avatar-group', [props.size], []));

const displayUrls = computed(() => props.urls.slice(0, props.maxCount));

const showMore = computed(() => props.urls.length > props.maxCount);

const moreCount = computed(() => props.urls.length - props.maxCount);
</script>

<style scoped lang="scss">
.tsm-avatar-group {
  --tsm-avatar-group-size: 40px;
  display: flex;
  align-items: center;
  border-radius: var(--tsm-radius-full);
  border: 1px solid var(--tsm-color-border-primary);
  box-sizing: border-box;
  box-shadow:
    0 2px 2px 0 rgba(1, 2, 11, 0.02),
    0 1px 1px 0 rgba(1, 2, 11, 0.02);
  background: var(--tsm-color-bg-white);
}

.tsm-avatar-group-item {
  border: 1px solid var(--tsm-color-text-white);
}

.tsm-avatar-group-item + .tsm-avatar-group-item {
  margin-left: -6px;
}

.tsm-avatar-group-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tsm-avatar-group-size);
  height: var(--tsm-avatar-group-size);
  margin-left: -6px;
  color: var(--tsm-color-text-primary);
  text-align: center;
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  border-radius: var(--tsm-radius-full);
  border: 1px solid var(--tsm-color-bg-white);
  background: var(--tsm-color-bg-tertiary);
  box-sizing: border-box;
}

.tsm-avatar-group--xs {
  --tsm-avatar-group-size: 22px;
}

.tsm-avatar-group--xs .tsm-avatar-group-more {
  font-size: var(--tsm-font-size-text-s);
  line-height: var(--tsm-line-height-text-xs);
}

.tsm-avatar-group--s {
  --tsm-avatar-group-size: 32px;
}

.tsm-avatar-group--s .tsm-avatar-group-more {
  font-size: var(--tsm-font-size-text-m);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-avatar-group--m {
  --tsm-avatar-group-size: 40px;
}

.tsm-avatar-group--m .tsm-avatar-group-more {
  font-size: var(--tsm-font-size-text-m);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-avatar-group--l {
  --tsm-avatar-group-size: 48px;
}

.tsm-avatar-group--l .tsm-avatar-group-more {
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-avatar-group--xl {
  --tsm-avatar-group-size: 56px;
}

.tsm-avatar-group--xl .tsm-avatar-group-more {
  font-size: var(--tsm-font-size-text-xl);
  line-height: var(--tsm-line-height-text-xl);
}
</style>
