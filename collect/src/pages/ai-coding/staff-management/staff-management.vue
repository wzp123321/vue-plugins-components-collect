<template>
  <div class="staff-management">
    <!-- 搜索栏 -->
    <EmployeeSearch
      v-model:keyword="keyword"
      v-model:selectedType="selectedType"
      :types="types"
      @search="handleSearch"
      @reset="resetQuery"
      @create="openCreate"
    />

    <!-- 表格 -->
    <EmployeeTable :data="pageData" :start="start" @detail="openDetail" @edit="openEdit" @delete="confirmDelete" />

    <!-- 分页 -->
    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <EmployeeDetailDialog v-model:visible="detailVisible" :row="detailRow" />

    <!-- 编辑/新增弹窗 -->
    <EmployeeEditDialog
      v-model:visible="editVisible"
      :is-create="isCreate"
      :edit-row="editRow"
      :types="types"
      @save="saveEdit"
    />
  </div>
</template>

<script lang="ts" setup>
import { useEmployees } from './hooks/useEmployees';
import EmployeeSearch from './components/EmployeeSearch.vue';
import EmployeeTable from './components/EmployeeTable.vue';
import EmployeeDetailDialog from './components/EmployeeDetailDialog.vue';
import EmployeeEditDialog from './components/EmployeeEditDialog.vue';

const {
  types,
  keyword,
  selectedType,
  pageSize,
  currentPage,
  total,
  start,
  pageData,
  detailVisible,
  editVisible,
  detailRow,
  editRow,
  isCreate,
  resetQuery,
  openDetail,
  openCreate,
  openEdit,
  saveEdit,
  confirmDelete,
  handleSearch,
  handlePageChange,
} = useEmployees();
</script>

<style lang="less" scoped>
.staff-management {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
