<template>
  <DemoHub :tabs="tabs" />
</template>

<script lang="ts" setup>
import DemoHub, { type DemoHubTab } from '@/components/demo-hub/demo-hub.vue';
import BabylonBaseDemo from '../babylon-base/babylon-base.vue';
import BabylonMeshDemo from '../babylon-mesh/babylon-mesh.vue';
import BabylonParamsDemo from '../babylon-params/babylon-params.vue';
import BabylonTextureDemo from '../babylon-texture/babylon-texture.vue';

defineOptions({ name: 'BabylonLab' });

const tabs: DemoHubTab[] = [
  { key: 'base', label: '基础场景', component: BabylonBaseDemo },
  { key: 'mesh', label: '几何形状', component: BabylonMeshDemo },
  { key: 'params', label: '参数化建模', component: BabylonParamsDemo },
  { key: 'texture', label: '材质贴图', component: BabylonTextureDemo },
];
</script>
