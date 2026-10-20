<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import CopyCloneDemo from './copy-clone/copy-clone.vue';
import DebounceThrottleDemo from './debounce-throttle/debounce-throttle.vue';
import EventBusDemo from './event-bus/event-bus.vue';
import ClipboardDemo from './clipboard/clipboard.vue';
import IndexeddbDemo from './indexeddb/indexeddb.vue';

defineOptions({ name: 'UtilsLab' });

const tabs: DemoHubTab[] = [
  { key: 'copy-clone', label: '深拷贝与浅拷贝', icon: '🔁', component: CopyCloneDemo },
  { key: 'debounce-throttle', label: '防抖节流', icon: '⏱', component: DebounceThrottleDemo },
  { key: 'event-bus', label: '事件总线 mitt', icon: '📡', component: EventBusDemo },
  { key: 'clipboard', label: '剪贴板', icon: '📋', component: ClipboardDemo },
  { key: 'indexeddb', label: 'IndexedDB', icon: '🗄', component: IndexeddbDemo },
];
</script>
