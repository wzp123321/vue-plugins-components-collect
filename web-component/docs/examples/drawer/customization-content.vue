<template>
  <te-button text @click="table = true"
    >Open Drawer with nested table</te-button
  >
  <te-button text @click="dialog = true"
    >Open Drawer with nested form</te-button
  >
  <te-drawer
    v-model="table"
    title="I have a nested table inside!"
    direction="rtl"
    size="50%"
  >
    <te-table :data="gridData">
      <te-table-column property="date" label="Date" width="150" />
      <te-table-column property="name" label="Name" width="200" />
      <te-table-column property="address" label="Address" />
    </te-table>
  </te-drawer>

  <te-drawer
    ref="drawerRef"
    v-model="dialog"
    title="I have a nested form inside!"
    :before-close="handleClose"
    direction="ltr"
    class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <te-form :model="form">
        <te-form-item label="Name" :label-width="formLabelWidth">
          <te-input v-model="form.name" autocomplete="off" />
        </te-form-item>
        <te-form-item label="Area" :label-width="formLabelWidth">
          <te-select
            v-model="form.region"
            placeholder="Please select activity area"
          >
            <te-option label="Area1" value="shanghai" />
            <te-option label="Area2" value="beijing" />
          </te-select>
        </te-form-item>
      </te-form>
      <div class="demo-drawer__footer">
        <te-button @click="cancelForm">Cancel</te-button>
        <te-button type="primary" :loading="loading" @click="onClick">{{
          loading ? 'Submitting ...' : 'Submit'
        }}</te-button>
      </div>
    </div>
  </te-drawer>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { TeDrawer, TeMessageBox } from '@tiansu/element-plus'

const formLabelWidth = '80px'
let timer

const table = ref(false)
const dialog = ref(false)
const loading = ref(false)

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
    name: 'Peter Parker',
    address: 'Queens, New York City',
  },
  {
    date: '2016-05-04',
    name: 'Peter Parker',
    address: 'Queens, New York City',
  },
  {
    date: '2016-05-01',
    name: 'Peter Parker',
    address: 'Queens, New York City',
  },
  {
    date: '2016-05-03',
    name: 'Peter Parker',
    address: 'Queens, New York City',
  },
]

const drawerRef = ref<InstanceType<typeof TeDrawer>>()
const onClick = () => {
  drawerRef.value!.close()
}

const handleClose = (done) => {
  if (loading.value) {
    return
  }
  TeMessageBox.confirm('Do you want to submit?')
    .then(() => {
      loading.value = true
      timer = setTimeout(() => {
        done()
        // 动画关闭需要一定的时间
        setTimeout(() => {
          loading.value = false
        }, 400)
      }, 2000)
    })
    .catch(() => {
      // catch error
    })
}

const cancelForm = () => {
  loading.value = false
  dialog.value = false
  clearTimeout(timer)
}
</script>
