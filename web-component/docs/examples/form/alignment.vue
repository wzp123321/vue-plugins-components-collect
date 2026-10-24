<template>
  <te-radio-group v-model="labelPosition" label="label position">
    <te-radio-button label="left">Left</el-radio-button>
    <te-radio-button label="right">Right</el-radio-button>
    <te-radio-button label="top">Top</el-radio-button>
  </el-radio-group>
  <div style="margin: 20px" />
  <te-form
    :label-position="labelPosition"
    label-width="100px"
    :model="formLabelAlign"
    style="max-width: 460px"
  >
    <te-form-item label="Name">
      <te-input v-model="formLabelAlign.name" />
    </el-form-item>
    <te-form-item label="Activity zone">
      <te-input v-model="formLabelAlign.region" />
    </el-form-item>
    <te-form-item label="Activity form">
      <te-input v-model="formLabelAlign.type" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const labelPosition = ref('right')

const formLabelAlign = reactive({
  name: '',
  region: '',
  type: '',
})
</script>
