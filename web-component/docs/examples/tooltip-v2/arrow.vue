<template>
  <te-tooltip-v2 aria-label="content" show-arrow always-on placement="top">
    <template #trigger>
      <te-button circle
        ><te-icon><Plus /></te-icon
      ></te-button>
    </template>
    Basic tooltip
  </te-tooltip-v2>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>
