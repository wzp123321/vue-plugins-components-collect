<template>
  <te-space :size="size" spacer="|">
    <div v-for="i in 2" :key="i">
      <te-button> button {{ i }} </te-button>
    </div>
  </te-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const size = ref(10)
</script>
