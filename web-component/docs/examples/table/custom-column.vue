<template>
  <te-table :data="tableData" style="width: 100%">
    <te-table-column label="Date" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <te-icon><timer /></te-icon>
          <span style="margin-left: 10px">{{ scope.row.date }}</span>
        </div>
      </template>
    </te-table-column>
    <te-table-column label="Name" width="180">
      <template #default="scope">
        <te-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <div>name: {{ scope.row.name }}</div>
            <div>address: {{ scope.row.address }}</div>
          </template>
          <template #reference>
            <te-tag>{{ scope.row.name }}</te-tag>
          </template>
        </te-popover>
      </template>
    </te-table-column>
    <te-table-column label="Operations">
      <template #default="scope">
        <te-button size="small" @click="handleEdit(scope.$index, scope.row)"
          >Edit</te-button
        >
        <te-button
          size="small"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)"
          >Delete</te-button
        >
      </template>
    </te-table-column>
  </te-table>
</template>

<script lang="ts" setup>
import { Timer } from '@element-plus/icons-vue'

interface User {
  date: string
  name: string
  address: string
}

const handleEdit = (index: number, row: User) => {
  console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
  console.log(index, row)
}

const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>
