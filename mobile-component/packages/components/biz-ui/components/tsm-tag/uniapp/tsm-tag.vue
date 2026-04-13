/** * Tag 标签组件 * @description 标签组件，用于标记和分类 */
<template>
  <view class="tsm-tag" :class="bemClass" :style="tagStyle" @tap="onClick">
    <text class="tsm-tag__text" :style="textStyle">{{ text }}</text>
    <view v-if="closable" class="tsm-tag__close" @tap.stop="onClose">
      <icon-setting />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TagProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TagProps>(), defaultProps);

const emit = defineEmits<{
  click: [];
  close: [];
}>();

const bemClass = computed(() => {
  return bem('tag', [props.type, props.size, props.shape], [], props.customClass);
});

const tagStyle = computed(() => ({
  ...(props.bgColor ? { backgroundColor: props.bgColor } : {}),
  ...(props.color ? { color: props.color } : {}),
  ...props.customStyle,
}));

const textStyle = computed(() => (props.color ? { color: props.color } : {}));
const closeIconColor = computed(() => props.color || 'currentColor');

const onClick = () => {
  emit('click');
};

const onClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-tag {
  @include tsm-display-inline-flex();
  align-items: center;
  padding: 0 var(--tsm-spacing-m);
  border-radius: var(--tsm-radius-xs);
  color: var(--tsm-color-static-white);
  background-color: var(--tsm-color-info);
}

.tsm-tag--small {
  height: 20px;
  font-size: 12px;
}

.tsm-tag--medium {
  height: 24px;
  font-size: 14px;
}

.tsm-tag--large {
  height: 28px;
  font-size: 16px;
}

.tsm-tag--circle {
  border-radius: var(--tsm-radius-full);
}

.tsm-tag--mark {
  border-radius: 0 100px 100px 0;
}

.tsm-tag__text {
  white-space: nowrap;
}

.tsm-tag__close {
  margin-left: var(--tsm-spacing-xs);
}

.tsm-tag--primary {
  background-color: var(--tsm-color-primary);
}

.tsm-tag--success {
  background-color: var(--tsm-color-success);
}

.tsm-tag--warning {
  background-color: var(--tsm-color-warning);
}

.tsm-tag--error {
  background-color: var(--tsm-color-danger);
}

.tsm-tag--info {
  background-color: var(--tsm-color-info);
}
</style>
