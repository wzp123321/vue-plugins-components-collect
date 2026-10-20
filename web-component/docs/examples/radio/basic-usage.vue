<template>
  <div class="mb-2 flex items-center text-sm">
    <te-radio-group v-model="radio1" class="ml-4">
      <te-radio label="1" size="large">Option 1</te-radio>
      <te-radio label="2" size="large">Option 2</te-radio>
    </te-radio-group>
  </div>
  <div class="my-2 flex items-center text-sm">
    <te-radio-group v-model="radio2" class="ml-4">
      <te-radio label="1">Option 1</te-radio>
      <te-radio label="2">Option 2</te-radio>
    </te-radio-group>
  </div>
  <div class="my-4 flex items-center text-sm">
    <te-radio-group v-model="radio3" class="ml-4">
      <te-radio label="1" size="small">Option 1</te-radio>
      <te-radio label="2" size="small">Option 2</te-radio>
    </te-radio-group>
  </div>
  <div class="mb-2 flex items-center text-sm">
    <te-radio-group v-model="radio3" disabled class="ml-4">
      <te-radio label="1" size="small">Option 1</te-radio>
      <te-radio label="2" size="small">Option 2</te-radio>
    </te-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio1 = ref('1')
const radio2 = ref('1')
const radio3 = ref('1')
</script>
