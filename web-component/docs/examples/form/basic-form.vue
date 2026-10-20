<template>
  <te-form :model="form" label-width="120px">
    <te-form-item label="Activity name">
      <te-input v-model="form.name" />
    </te-form-item>
    <te-form-item label="Activity zone">
      <te-select v-model="form.region" placeholder="please select your zone">
        <te-option label="Zone one" value="shanghai" />
        <te-option label="Zone two" value="beijing" />
      </te-select>
    </te-form-item>
    <te-form-item label="Activity time">
      <te-col :span="11">
        <te-date-picker
          v-model="form.date1"
          type="date"
          placeholder="Pick a date"
          style="width: 100%"
        />
      </te-col>
      <te-col :span="2" class="text-center">
        <span class="text-gray-500">-</span>
      </te-col>
      <te-col :span="11">
        <te-time-picker
          v-model="form.date2"
          placeholder="Pick a time"
          style="width: 100%"
        />
      </te-col>
    </te-form-item>
    <te-form-item label="Instant delivery">
      <te-switch v-model="form.delivery" />
    </te-form-item>
    <te-form-item label="Activity type">
      <te-checkbox-group v-model="form.type">
        <te-checkbox label="Online activities" name="type" />
        <te-checkbox label="Promotion activities" name="type" />
        <te-checkbox label="Offline activities" name="type" />
        <te-checkbox label="Simple brand exposure" name="type" />
      </te-checkbox-group>
    </te-form-item>
    <te-form-item label="Resources">
      <te-radio-group v-model="form.resource">
        <te-radio label="Sponsor" />
        <te-radio label="Venue" />
      </te-radio-group>
    </te-form-item>
    <te-form-item label="Activity form">
      <te-input v-model="form.desc" type="textarea" />
    </te-form-item>
    <te-form-item>
      <te-button type="primary" @click="onSubmit">Create</te-button>
      <te-button>Cancel</te-button>
    </te-form-item>
  </te-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

// do not use same name with ref
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

const onSubmit = () => {
  console.log('submit!')
}
</script>
