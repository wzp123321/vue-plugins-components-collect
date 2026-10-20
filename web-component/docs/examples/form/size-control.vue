<template>
  <div>
    <te-radio-group v-model="size" label="size control">
      <te-radio-button label="large">large</te-radio-button>
      <te-radio-button label="default">default</te-radio-button>
      <te-radio-button label="small">small</te-radio-button>
    </te-radio-group>
    <te-radio-group v-model="labelPosition" label="position control">
      <te-radio-button label="left">Left</te-radio-button>
      <te-radio-button label="right">Right</te-radio-button>
      <te-radio-button label="top">Top</te-radio-button>
    </te-radio-group>
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
    </te-form-item>
    <te-form-item label="Activity zone">
      <te-select
        v-model="sizeForm.region"
        placeholder="please select your zone"
      >
        <te-option label="Zone one" value="shanghai" />
        <te-option label="Zone two" value="beijing" />
      </te-select>
    </te-form-item>
    <te-form-item label="Activity time">
      <te-col :span="11">
        <te-date-picker
          v-model="sizeForm.date1"
          type="date"
          label="Pick a date"
          placeholder="Pick a date"
          style="width: 100%"
        />
      </te-col>
      <te-col class="text-center" :span="1" style="margin: 0 0.5rem">-</te-col>
      <te-col :span="11">
        <te-time-picker
          v-model="sizeForm.date2"
          label="Pick a time"
          placeholder="Pick a time"
          style="width: 100%"
        />
      </te-col>
    </te-form-item>
    <te-form-item label="Activity type">
      <te-checkbox-group v-model="sizeForm.type">
        <te-checkbox-button label="Online activities" name="type" />
        <te-checkbox-button label="Promotion activities" name="type" />
      </te-checkbox-group>
    </te-form-item>
    <te-form-item label="Resources">
      <te-radio-group v-model="sizeForm.resource">
        <te-radio border label="Sponsor" />
        <te-radio border label="Venue" />
      </te-radio-group>
    </te-form-item>
    <te-form-item>
      <te-button type="primary" @click="onSubmit">Create</te-button>
      <te-button>Cancel</te-button>
    </te-form-item>
  </te-form>
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
