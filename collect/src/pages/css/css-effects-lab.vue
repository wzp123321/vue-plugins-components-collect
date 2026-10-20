<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import WhitespaceDemo from './css-whitespace-wordbreak-wordwrap/css-whitespace-wordbreak-wordwrap.vue';
import ZindexDemo from './css-zindex/css-zindex.vue';
import PseudoElementDemo from './css-pseudo-element/css-pseudo-element.vue';
import BackdropDemo from './css-filter/css-filter.vue';
import KeyframeDemo from './css-keyframe-animation/css-keyframe-animation.vue';
import VarThemeDemo from './css-var-theme/css-var-theme.vue';

defineOptions({ name: 'CssEffectsLab' });

const tabs: DemoHubTab[] = [
  { key: 'keyframe', label: '关键帧动画', component: KeyframeDemo },
  { key: 'backdrop', label: '毛玻璃', component: BackdropDemo },
  { key: 'var-theme', label: '变量主题', component: VarThemeDemo },
  { key: 'zindex', label: 'z-index 层叠', component: ZindexDemo },
  { key: 'pseudo', label: '伪元素伪类', component: PseudoElementDemo },
  { key: 'whitespace', label: '换行处理', component: WhitespaceDemo },
];
</script>
