<template>
  <div class="cg-auto-fill">
    <div class="caf-fill">
      <div v-for="item in 3" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
    </div>
    <a-divider />
    <div class="caf-fit">
      <div v-for="item in 3" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
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
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .caf-fit {
    gap: 24px;
    height: 100px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    // grid-template-columns: fit-content(100px) fit-content(100px) 40px auto; 
  }
}
</style>
