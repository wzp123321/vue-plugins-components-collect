<template>
  <te-button text @click="dialogTableVisible = true">
    open a Table nested Dialog
  </te-button>

  <te-dialog v-model="dialogTableVisible" title="Shipping address">
    <te-table :data="gridData">
      <te-table-column property="date" label="Date" width="150" />
      <te-table-column property="name" label="Name" width="200" />
      <te-table-column property="address" label="Address" />
    </te-table>
  </te-dialog>

  <!-- Form -->
  <te-button text @click="dialogFormVisible = true">
    open a Form nested Dialog
  </te-button>

  <te-dialog v-model="dialogFormVisible" title="Shipping address">
    <te-form :model="form">
      <te-form-item label="Promotion name" :label-width="formLabelWidth">
        <te-input v-model="form.name" autocomplete="off" />
      </te-form-item>
      <te-form-item label="Zones" :label-width="formLabelWidth">
        <te-select v-model="form.region" placeholder="Please select a zone">
          <te-option label="Zone No.1" value="shanghai" />
          <te-option label="Zone No.2" value="beijing" />
        </te-select>
      </te-form-item>
    </te-form>
    <template #footer>
      <span class="dialog-footer">
        <te-button @click="dialogFormVisible = false">Cancel</te-button>
        <te-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </te-button>
      </span>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const dialogTableVisible = ref(false)
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const gridData = [
  {
    date: '2016-05-02',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-04',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-01',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
  {
    date: '2016-05-03',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District',
  },
]
</script>
<style scoped>
.te-button--text {
  margin-right: 15px;
}
.te-select {
  width: 300px;
}
.te-input {
  width: 300px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
