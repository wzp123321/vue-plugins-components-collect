<template>
  <te-radio-group v-model="radio">
    <te-radio :label="3">Option A</te-radio>
    <te-radio :label="6">Option B</te-radio>
    <te-radio :label="9">Option C</te-radio>
  </te-radio-group>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const radio = ref(3)
</script>
