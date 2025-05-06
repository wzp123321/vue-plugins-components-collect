<template>
  <div class="cg-example">
    <ceGridFixedWidth></ceGridFixedWidth>
    <a-divider />
    <ceGridHalve></ceGridHalve>
    <a-divider />
    <ceGridAuto></ceGridAuto>
    <a-divider />
    <ceGridCenter></ceGridCenter>
    <a-divider />
    <ceGridSpaceBetween></ceGridSpaceBetween>
    <a-divider />
    <ceGridGrail></ceGridGrail>
    <a-divider />
    <ceGridReseau></ceGridReseau>
  </div>
</template>
<script lang="ts" setup>
import ceGridHalve from './ce-grid-halve.vue';
import ceGridFixedWidth from './ce-grid-fixed-width.vue';
import ceGridAuto from './ce-grid-auto.vue';
import ceGridCenter from './ce-grid-center.vue';
import ceGridSpaceBetween from './ce-grid-space-between.vue';
import ceGridGrail from './ce-grid-grail.vue';
import ceGridReseau from './ce-grid-reseau.vue';
</script>
<style lang="less" scoped>
.cg-example {
  width: 100%;
  height: 100%;
}
</style>
