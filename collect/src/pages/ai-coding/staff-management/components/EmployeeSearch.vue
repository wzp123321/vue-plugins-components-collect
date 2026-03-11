<template>
  <div class="toolbar">
    <div class="left">
      <el-button type="primary" @click="$emit('create')">新增</el-button>
    </div>
    <div class="right">
      <el-input
        :model-value="keyword"
        @update:model-value="$emit('update:keyword', $event)"
        v-inputFilter:text="{ allowChinese: true, allowSpace: false, regExp: null }"
        placeholder="请输入姓名"
        :maxlength="50"
        clearable
        style="width: 220px"
        @keyup.enter.native="$emit('search')"
      />
      <el-select
        :model-value="selectedType"
        @update:model-value="$emit('update:selectedType', $event)"
        placeholder="员工类型"
        clearable
        style="width: 160px; margin-left: 12px"
      >
        <el-option v-for="t in types" :key="t" :label="t" :value="t" />
      </el-select>
      <el-button type="primary" style="margin-left: 12px" @click="$emit('search')">搜索</el-button>
      <el-button style="margin-left: 8px" @click="$emit('reset')">重置</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { EmployeeType } from '../types';
defineProps<{
  keyword: string;
  selectedType: EmployeeType | '';
  types: EmployeeType[];
}>();
defineEmits<{
  (e: 'update:keyword', v: string): void;
  (e: 'update:selectedType', v: EmployeeType | ''): void;
  (e: 'search'): void;
  (e: 'reset'): void;
  (e: 'create'): void;
}>();
</script>
<style lang="less" scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

