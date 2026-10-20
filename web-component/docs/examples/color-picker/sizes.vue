<template>
  <div class="demo-color-sizes">
    <te-color-picker v-model="color" size="large" />
    <te-color-picker v-model="color" />
    <te-color-picker v-model="color" size="small" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const color = ref('409EFF')
</script>

<style>
.demo-color-sizes .te-color-picker:not(:last-child) {
  margin-right: 16px;
}
</style>
