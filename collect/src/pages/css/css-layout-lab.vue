<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import GridDemo from './css-grid/css-grid.vue';
import FlexDemo from './css-flex/css-flex.vue';
import ResponsiveDemo from './css-responsive/css-responsive.vue';
import SemantizationDemo from './semantization/semantization.vue';

defineOptions({ name: 'CssLayoutLab' });

const tabs: DemoHubTab[] = [
  { key: 'grid', label: 'Grid 布局', component: GridDemo },
  { key: 'flex', label: 'Flex 布局', component: FlexDemo },
  { key: 'responsive', label: '响应式布局', component: ResponsiveDemo },
  { key: 'semantization', label: '语义化标签', component: SemantizationDemo },
];
</script>
