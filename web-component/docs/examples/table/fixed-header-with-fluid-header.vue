<template>
  <te-table :data="tableData" style="width: 100%" max-height="250">
    <te-table-column fixed prop="date" label="Date" width="150" />
    <te-table-column prop="name" label="Name" width="120" />
    <te-table-column prop="state" label="State" width="120" />
    <te-table-column prop="city" label="City" width="120" />
    <te-table-column prop="address" label="Address" width="600" />
    <te-table-column prop="zip" label="Zip" width="120" />
    <te-table-column fixed="right" label="Operations" width="120">
      <template #default="scope">
        <te-button
          link
          type="primary"
          size="small"
          @click.prevent="deleteRow(scope.$index)"
        >
          Remove
        </te-button>
      </template>
    </te-table-column>
  </te-table>
  <te-button class="mt-4" style="width: 100%" @click="onAddItem"
    >Add Item</te-button
  >
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import dayjs from 'dayjs'

const now = new Date()

const tableData = ref([
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
])

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}

const onAddItem = () => {
  now.setDate(now.getDate() + 1)
  tableData.value.push({
    date: dayjs(now).format('YYYY-MM-DD'),
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  })
}
</script>
