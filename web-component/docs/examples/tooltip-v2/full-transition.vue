<template>
  <te-tooltip-v2 full-transition :transition-props="transitionProps">
    <template #trigger>
      <te-button circle
        ><te-icon><Plus /></te-icon
      ></te-button>
    </template>
    <div>content</div>
  </te-tooltip-v2>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

const transitionProps = {
  name: 'te-fade-in-linear',
}
</script>
