/** * Button 按钮 * @description 按钮组件，支持各种形状、大小、加载等功能。 */
<template>
  <view :class="bemClass">
    <icon-add />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TestProps } from './props';
import { defaultProps } from './props';
import { addStyle, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<TestProps>(), defaultProps);

const emit = defineEmits<{
  click: [e: Event];
}>();

const bemClass = computed(() => {
  return bem('button', [props.type], []);
});
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-test {
  height: 40px;
  padding: 0 12px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--tsm-color-primary-border);
  border-radius: var(--tsm-radius-s);
  background-color: var(--tsm-color-primary);
  color: var(--tsm-color-static-white);
  position: relative;
  @include tsm-display-inline-flex();
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-direction: row;
  line-height: 1;
}

.tsm-test--info {
  color: var(--tsm-color-static-white);
  background-color: var(--tsm-color-info);
  border-color: var(--tsm-color-info-border);
}

.tsm-test--success {
  color: var(--tsm-color-static-white);
  background-color: var(--tsm-color-success);
  border-color: var(--tsm-color-success-border);
}
</style>
