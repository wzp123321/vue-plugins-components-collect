<template>
  <div class="cg-auto-fill">
    <div class="caf-fill">
      <div v-for="item in 6" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
    </div>
    <a-divider />
    <div class="caf-fit">
      <div v-for="item in 6" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { mapColor } from '../../../../utils';
</script>
<style lang="less" scoped>
.cg-auto-fill {
  .item {
    height: 100px;
  }

  .caf-fill {
    gap: 24px;
    height: 100px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
  }

  .caf-fit {
    gap: 24px;
    height: 100px;
    display: grid;
    grid-template-columns: repeat(auto-fit, 100px);
  }
}
</style>
