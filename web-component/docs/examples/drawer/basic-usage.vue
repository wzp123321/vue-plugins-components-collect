<template>
  <te-radio-group v-model="direction">
    <te-radio label="ltr">left to right</el-radio>
    <te-radio label="rtl">right to left</el-radio>
    <te-radio label="ttb">top to bottom</el-radio>
    <te-radio label="btt">bottom to top</el-radio>
  </el-radio-group>

  <te-button type="primary" style="margin-left: 16px" @click="drawer = true">
    open
  </el-button>
  <te-button type="primary" style="margin-left: 16px" @click="drawer2 = true">
    with footer
  </el-button>

  <te-drawer
    v-model="drawer"
    title="I am the title"
    :direction="direction"
    :before-close="handleClose"
  >
    <span>Hi, there!</span>
  </el-drawer>
  <te-drawer v-model="drawer2" :direction="direction">
    <template #header>
      <h4>set title by slot</h4>
    </template>
    <template #default>
      <div>
        <te-radio v-model="radio1" label="Option 1" size="large"
          >Option 1</te-radio
        >
        <te-radio v-model="radio1" label="Option 2" size="large"
          >Option 2</te-radio
        >
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <te-button @click="cancelClick">cancel</el-button>
        <te-button type="primary" @click="confirmClick">confirm</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const drawer = ref(false)
const drawer2 = ref(false)
const direction = ref('rtl')
const radio1 = ref('Option 1')
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('Are you sure you want to close this?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
function cancelClick() {
  drawer2.value = false
}
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm to chose ${radio1.value} ?`)
    .then(() => {
      drawer2.value = false
    })
    .catch(() => {
      // catch error
    })
}
</script>
