<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import TeleportDemo from './teleport/teleport.vue';
import SuspenseDemo from './suspense/suspense.vue';
import ProvideInjectDemo from './provide-inject/provide-inject.vue';
import WatchCompareDemo from './watch-compare/watch-compare.vue';

defineOptions({ name: 'Vue3CoreLab' });

const tabs: DemoHubTab[] = [
  { key: 'teleport', label: 'Teleport 传送门', component: TeleportDemo },
  { key: 'suspense', label: 'Suspense 异步组件', component: SuspenseDemo },
  { key: 'provide-inject', label: 'provide / inject', component: ProvideInjectDemo },
  { key: 'watch-compare', label: 'watch 对比', component: WatchCompareDemo },
];
</script>
