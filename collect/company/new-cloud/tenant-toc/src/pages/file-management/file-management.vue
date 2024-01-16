<template>
  <div id="file-management">
    <page-container title="文件管理">
      <template #pageSearch>
        <fm-searchbar />
      </template>
      <template #pageContent>
        <fm-table />
      </template>
    </page-container>
  </div>
</template>
<script lang="ts" setup>
import FmSearchbar from './components/fm-searchbar/fm-searchbar.vue';
import FmTable from './components/fm-table/fm-table.vue';
</script>
<style lang="less" scoped>
#file-management {
  height: 100%;

  :deep(.tenant-pagecontainer__detail) {
    min-width: 1440px;
  }
}
</style>
