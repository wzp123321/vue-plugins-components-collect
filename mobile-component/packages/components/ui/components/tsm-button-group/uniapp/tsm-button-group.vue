<!--
 * @Author: liuguanqi liugq@tiansu-china.com
 * @Date: 2026-04-13 10:32:32
 * @LastEditors: liuguanqi liugq@tiansu-china.com
 * @LastEditTime: 2026-04-13 11:25:03
 * @FilePath: \ts-mobile-ui\packages\components\ui\components\tsm-button-group\uniapp\tsm-button-group.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
/** * ButtonGroup 按钮组组件 * @description 按钮组组件，用于组合多个按钮 */
<template>
  <view class="tsm-button-group" :class="customClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import type { ButtonGroupProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<ButtonGroupProps>(), defaultProps);

// 提供标记，让子按钮知道自己在 group 中
provide('tsmButtonGroup', true);
</script>

<style scoped lang="scss">
.tsm-button-group {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  vertical-align: middle;

  // 按钮组外边框
  border: 1px solid var(--tsm-color-border-primary, #d9d9d9);
  border-radius: var(--tsm-border-radius-sm, 4px);
  overflow: hidden;
}
</style>
