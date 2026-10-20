<template>
  <te-radio-group v-model="treeProps.checkStrictly">
    <te-radio-button :value="true" label="true" />
    <te-radio-button :value="false" label="false" />
  </te-radio-group>
  <te-table
    :data="tableData"
    :tree-props="treeProps"
    row-key="id"
    default-expand-all
  >
    <te-table-column type="selection" width="55" :selectable="selectable" />
    <te-table-column prop="date" label="Date" />
    <te-table-column prop="name" label="Name" />
    <te-table-column prop="address" label="Address" />
  </te-table>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

interface User {
  id: number;
  date: string;
  name: string;
  address: string;
  hasChildren?: boolean;
  children?: User[];
}

const treeProps = reactive({
  checkStrictly: false,
});

const selectable = (row: User) => ![1, 31].includes(row.id);

const tableData: User[] = [
  {
    id: 1,
    date: '2016-05-02',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 2,
    date: '2016-05-04',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 3,
    date: '2016-05-01',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
    children: [
      {
        id: 31,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
      },
      {
        id: 32,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
      },
    ],
  },
  {
    id: 4,
    date: '2016-05-03',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
];
</script>
