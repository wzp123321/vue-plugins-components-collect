<template>
  <div>
    <te-radio-group v-model="radio1" size="large">
      <te-radio-button label="New York" />
      <te-radio-button label="Washington" />
      <te-radio-button label="Los Angeles" />
      <te-radio-button label="Chicago" />
    </te-radio-group>
  </div>
  <div style="margin-top: 20px">
    <te-radio-group v-model="radio2">
      <te-radio-button label="New York" />
      <te-radio-button label="Washington" />
      <te-radio-button label="Los Angeles" />
      <te-radio-button label="Chicago" />
    </te-radio-group>
  </div>
  <div style="margin-top: 20px">
    <te-radio-group v-model="radio3" size="small">
      <te-radio-button label="New York" />
      <te-radio-button label="Washington" disabled />
      <te-radio-button label="Los Angeles" />
      <te-radio-button label="Chicago" />
    </te-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio1 = ref('New York')
const radio2 = ref('New York')
const radio3 = ref('New York')
</script>
