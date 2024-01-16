<template>
  <div class="ad-share-strategy">
    <page-common :title="'分摊策略'">
      <template v-slot:pageSearch>
        <adss-search-bar></adss-search-bar>
      </template>
      <template v-slot:pageContent>
        <adss-table></adss-table>
      </template>
    </page-common>
  </div>
</template>

<script lang="ts" setup>
import AdssTable from './components/adss-table/adss-table.vue';
import AdssSearchBar from './components/adss-search-bar/adss-search-bar.vue';
</script>

<style lang="less">
.ad-share-strategy {
  height: 100%;
}
</style>
