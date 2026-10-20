<template>
    <te-search v-model="text" @input="valueInput" />
  </template>
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { TeSearch } from '@ts-web-package/components/lib/te-search';
  const text = ref('');
  const valueInput = (value: any) => {
    console.log('防抖返回值', value);
  };
  </script>
  <script lang="ts">
  export default {
    name: 'te-search-demo',
  };
  </script>
  