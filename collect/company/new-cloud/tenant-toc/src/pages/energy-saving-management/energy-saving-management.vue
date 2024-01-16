<template>
  <div id="energy-saving-management">
    <page-container title="节能量管理" :hasSearch="false">
      <template #pageContent>
        <EsmTable></EsmTable>
      </template>
    </page-container>
  </div>
</template>
<script lang="ts" setup>
import EsmTable from './components/esm-table/esm-table.vue';
</script>
<style lang="less" scoped>
#energy-saving-management {
  height: 100%;

  :deep(.tenant-pagecontainer__detail) {
    min-width: 1440px;
  }
}
</style>
