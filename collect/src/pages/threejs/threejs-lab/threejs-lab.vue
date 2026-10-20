<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import ThreeBasicDemo from '../threejs-basic/threejs-basic.vue';
import ThreeSceneDemo from '../threejs-scene/threejs-scene.vue';
import ThreeSunDemo from '../threejs-sun/threejs-sun.vue';

defineOptions({ name: 'ThreejsLab' });

const tabs: DemoHubTab[] = [
  { key: 'basic', label: '基础图形', component: ThreeBasicDemo },
  { key: 'scene', label: '场景与物体', component: ThreeSceneDemo },
  { key: 'sun', label: '太阳地球', component: ThreeSunDemo },
];
</script>
