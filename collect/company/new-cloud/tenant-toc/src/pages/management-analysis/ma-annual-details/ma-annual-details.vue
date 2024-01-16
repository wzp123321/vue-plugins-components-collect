<template>
  <div id="ma-annual-details">
    <h3 class="ma-ad-title">能耗预算全期表</h3>
    <!-- <ma-ad-form></ma-ad-form> -->

    <main class="ma-ad-content">
      <ma-ad-toolbar></ma-ad-toolbar>
      <ma-ad-table class="mt12"></ma-ad-table>
    </main>
  </div>
</template>
<script lang="ts" setup>
import MaAdTable from './ma-ad-table/ma-ad-table.vue';
import MaAdToolbar from './ma-ad-toolbar/ma-ad-toolbar.vue';
</script>
<style lang="less" src="./ma-annual-details.less"></style>
