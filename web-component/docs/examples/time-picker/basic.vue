<template>
  <div class="example-basic">
    <te-time-picker v-model="value1" placeholder="Arbitrary time" />
    <te-time-picker
      v-model="value2"
      arrow-control
      placeholder="Arbitrary time"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value1 = ref()
const value2 = ref()
</script>

<style>
.example-basic .te-date-editor {
  margin: 8px;
}
</style>
