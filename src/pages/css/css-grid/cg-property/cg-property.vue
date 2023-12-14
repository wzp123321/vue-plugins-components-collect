<template>
  <div class="cg-property">
    <common-card title="Display-grid属性">
      <CpDisplay></CpDisplay>
    </common-card>
    <common-card title="auto-fill 关键字">
      <CgAutoFill></CgAutoFill>
    </common-card>
  </div>
</template>
<script lang="ts" setup>
import CpDisplay from './cp-display.vue';
import CgAutoFill from './cg-auto-fill.vue';
</script>
<style lang="less" scoped>
.cg-property {
  width: 100%;
  height: 100%;
}
</style>
