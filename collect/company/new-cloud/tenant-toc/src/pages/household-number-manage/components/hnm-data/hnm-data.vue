<!--
 * @Author: yut
 * @Date: 2023-08-11 16:45:05
 * @LastEditors: yut
 * @LastEditTime: 2023-09-27 14:36:05
 * @Descripttion: 
-->
<template>
  <div class="hnm-data">
    <!-- 搜索模块 -->
    <hnm-data-search />
    <!-- 表格模块 -->
    <hnm-data-table />
    <!-- 弹窗模块 -->
    <hnm-data-modal />
  </div>
</template>
<script lang="ts" setup>
import hnmDataSearch from './hnm-data-search/hnm-data-search.vue';
import hnmDataTable from './hnm-data-table/hnm-data-table.vue';
import hnmDataModal from './hnm-data-modal/hnm-data-modal.vue';
</script>
<style lang="less" scoped>
.hnm-data {
  width: 100%;
  height: 100%;
}
</style>
