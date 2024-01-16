<!--
 * @Author: yut
 * @Date: 2023-07-10 15:18:09
 * @LastEditors: yut
 * @LastEditTime: 2023-07-19 11:31:30
 * @Descripttion: 科室考核目标值维护
-->
<template>
  <div class="department-assessment-target">
    <page-common :title="'科室考核'" :showSearch="true">
      <template v-slot:pageSearch>
        <!-- 搜索栏 -->
        <dat-search></dat-search>
      </template>
      <template v-slot:pageContent>
        <!-- 表格 -->
        <da-table></da-table>
      </template>
    </page-common>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { DaTable, DatSearch } from './components';
import { datService } from './department-assessment-target.service';
onMounted(async () => {
  datService.initData();
  await datService.getSelectedEnergyCode();
  await datService.getTableData();
});
</script>

<style lang="less">
.department-assessment-target {
  width: 100%;
  height: 100%;
}
</style>
