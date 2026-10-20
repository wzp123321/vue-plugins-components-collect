<template>
  <te-button type="primary" style="margin-left: 16px" @click="drawer = true">
    open
  </te-button>

  <te-drawer v-model="drawer" title="I am the title" :with-header="false">
    <span>Hi there!</span>
  </te-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>
