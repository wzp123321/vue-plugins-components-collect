<template>
  <div>
    <te-radio-group v-model="radio1">
      <te-radio label="1" size="large" border>Option A</te-radio>
      <te-radio label="2" size="large" border>Option B</te-radio>
    </te-radio-group>
  </div>
  <div style="margin-top: 20px">
    <te-radio-group v-model="radio2">
      <te-radio label="1" border>Option A</te-radio>
      <te-radio label="2" border>Option B</te-radio>
    </te-radio-group>
  </div>
  <div style="margin-top: 20px">
    <te-radio-group v-model="radio3" size="small">
      <te-radio label="1" border>Option A</te-radio>
      <te-radio label="2" border disabled>Option B</te-radio>
    </te-radio-group>
  </div>
  <div style="margin-top: 20px">
    <te-radio-group v-model="radio4" size="small" disabled>
      <te-radio label="1" border>Option A</te-radio>
      <te-radio label="2" border>Option B</te-radio>
    </te-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio1 = ref('1')
const radio2 = ref('1')
const radio3 = ref('1')
const radio4 = ref('1')
</script>
