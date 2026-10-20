<template>
  <te-rate v-model="value" size="large" />
  <br />
  <te-rate v-model="value" />
  <br />
  <te-rate v-model="value" size="small" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(null)
</script>
