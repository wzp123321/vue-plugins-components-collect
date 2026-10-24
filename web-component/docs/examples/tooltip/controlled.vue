<template>
  <te-tooltip :visible="visible">
    <template #content>
      <span>Content</span>
    </template>
    <te-button @mouseenter="visible = true" @mouseleave="visible = false">
      Hover me
    </el-button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>
