<template>
  <div>
    <te-radio-group v-model="size" label="size control">
      <te-radio-button label="large">large</el-radio-button>
      <te-radio-button label="default">default</el-radio-button>
      <te-radio-button label="small">small</el-radio-button>
    </el-radio-group>
    <te-radio-group v-model="labelPosition" label="position control">
      <te-radio-button label="left">Left</el-radio-button>
      <te-radio-button label="right">Right</el-radio-button>
      <te-radio-button label="top">Top</el-radio-button>
    </el-radio-group>
  </div>
  <br />
  <te-form
    ref="form"
    :model="sizeForm"
    label-width="auto"
    :label-position="labelPosition"
    :size="size"
  >
    <te-form-item label="Activity name">
      <te-input v-model="sizeForm.name" />
    </el-form-item>
    <te-form-item label="Activity zone">
      <te-select
        v-model="sizeForm.region"
        placeholder="please select your zone"
      >
        <te-option label="Zone one" value="shanghai" />
        <te-option label="Zone two" value="beijing" />
      </el-select>
    </el-form-item>
    <te-form-item label="Activity time">
      <te-col :span="11">
        <te-date-picker
          v-model="sizeForm.date1"
          type="date"
          label="Pick a date"
          placeholder="Pick a date"
          style="width: 100%"
        />
      </el-col>
      <te-col class="text-center" :span="1" style="margin: 0 0.5rem">-</el-col>
      <te-col :span="11">
        <te-time-picker
          v-model="sizeForm.date2"
          label="Pick a time"
          placeholder="Pick a time"
          style="width: 100%"
        />
      </el-col>
    </el-form-item>
    <te-form-item label="Activity type">
      <te-checkbox-group v-model="sizeForm.type">
        <te-checkbox-button label="Online activities" name="type" />
        <te-checkbox-button label="Promotion activities" name="type" />
      </el-checkbox-group>
    </el-form-item>
    <te-form-item label="Resources">
      <te-radio-group v-model="sizeForm.resource">
        <te-radio border label="Sponsor" />
        <te-radio border label="Venue" />
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <te-button type="primary" @click="onSubmit">Create</el-button>
      <el-button>Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const size = ref('default')
const labelPosition = ref('right')

const sizeForm = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

function onSubmit() {
  console.log('submit!')
}
</script>

<style>
.te-radio-group {
  margin-right: 12px;
}
</style>
