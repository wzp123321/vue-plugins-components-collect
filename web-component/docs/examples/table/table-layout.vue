<template>
  <te-radio-group v-model="tableLayout">
    <te-radio-button label="fixed" />
    <te-radio-button label="auto" />
  </el-radio-group>
  <te-table :data="tableData" :table-layout="tableLayout">
    <te-table-column prop="date" label="Date" />
    <te-table-column prop="name" label="Name" />
    <te-table-column prop="address" label="Address" />
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tableLayout = ref('fixed')

const tableData = [
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
