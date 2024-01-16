<!--
 * @Author: yut
 * @Date: 2023-07-28 13:57:56
 * @LastEditors: yut
 * @LastEditTime: 2023-07-28 16:11:49
 * @Descripttion: 
-->
<template>
  <div class="energy-rate">
    <!-- 搜索 -->
    <ErSearchBar />
    <!-- 操作栏 -->
    <ErOperateBar />
    <!-- 表格 -->
    <ErDetailTable />
    <!-- 新增/编辑弹窗 -->
    <ErOperateModal />
  </div>
</template>
<script lang="ts" setup>
import ErSearchBar from './er-search-bar/er-search-bar.vue';
import ErOperateBar from './er-operate-bar/er-operate-bar.vue';
import ErDetailTable from './er-detail-table/er-detail-table.vue';
import ErOperateModal from './er-operate-modal/er-operate-modal.vue';
</script>
<style lang="less" scoped>
.energy-rate {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
./er-search-bar/er-search-bar.service
