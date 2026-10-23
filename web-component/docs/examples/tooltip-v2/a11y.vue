<template>
  <te-tooltip-v2 :aria-label="title">
    <template #trigger>
      <te-button
        ><el-icon><Delete /></te-icon
      ></el-button>
    </template>
    {{ content }}
  </te-tooltip-v2>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
const content = 'Delete'
const title = 'Delete item'
</script>
