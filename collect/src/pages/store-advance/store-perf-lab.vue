<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import PiniaPersistDemo from './pinia-persist/pinia-persist.vue';
import SetupStoreDemo from './setup-store/setup-store.vue';
import KeepAliveDemo from '../performance/keep-alive/keep-alive.vue';
import AsyncComponentDemo from '../performance/async-component/async-component.vue';

defineOptions({ name: 'StorePerfLab' });

const tabs: DemoHubTab[] = [
  { key: 'pinia-persist', label: 'Pinia 持久化', component: PiniaPersistDemo },
  { key: 'setup-store', label: 'Setup Store', component: SetupStoreDemo },
  { key: 'keep-alive', label: 'KeepAlive 缓存', component: KeepAliveDemo },
  { key: 'async-component', label: '异步组件懒加载', component: AsyncComponentDemo },
];
</script>
