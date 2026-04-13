<template>
  <view class="tsm-theme-provider" :class="[themeClass, customClass]" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeClass } from '@/uni_modules/@tiansu/ts-mobile-token/index';
import type { ThemeProviderProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<ThemeProviderProps>(), defaultProps);
const runtimeThemeClass = useThemeClass();

const themeClass = computed(() => {
  if (props.mode === 'light' || props.mode === 'dark') {
    return `tsm-theme-${props.mode}`;
  }
  return runtimeThemeClass.value;
});
</script>
