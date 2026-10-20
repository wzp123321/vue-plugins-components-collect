<template>
  <te-checkbox-group v-model="checkedCities" :min="1" :max="2">
    <te-checkbox v-for="city in cities" :key="city" :label="city">{{
      city
    }}</te-checkbox>
  </te-checkbox-group>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checkedCities = ref(['Shanghai', 'Beijing'])
const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']
</script>
