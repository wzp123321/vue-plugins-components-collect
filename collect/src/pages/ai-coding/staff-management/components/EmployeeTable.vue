<template>
  <el-table :data="data" border style="width: 100%">
    <el-table-column type="index" label="序号" width="70" :index="(i) => start + i + 1" />
    <el-table-column prop="name" label="员工姓名" min-width="140" />
    <el-table-column prop="type" label="员工类型" min-width="120" />
    <el-table-column prop="gender" label="员工性别" min-width="100" />
    <el-table-column label="是否离职" min-width="100">
      <template #default="{ row }">
        <el-tag :type="row.departed ? 'danger' : 'success'">{{ row.departed ? '是' : '否' }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" fixed="right" width="220">
      <template #default="{ row }">
        <el-button type="primary" text @click="$emit('detail', row)">查看</el-button>
        <el-button type="primary" text @click="$emit('edit', row)">编辑</el-button>
        <el-popconfirm title="确认删除该员工吗？" confirm-button-text="删除" cancel-button-text="取消" @confirm="$emit('delete', row)">
          <template #reference>
            <el-button type="danger" text>删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
import type { Employee } from '../types';
defineProps<{
  data: Employee[];
  start: number;
}>();
defineEmits<{
  (e: 'detail', row: Employee): void;
  (e: 'edit', row: Employee): void;
  (e: 'delete', row: Employee): void;
}>();
</script>

