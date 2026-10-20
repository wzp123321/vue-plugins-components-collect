<template>
  <te-steps :active="1">
    <te-step title="Step 1" :icon="Edit" />
    <te-step title="Step 2" :icon="Upload" />
    <te-step title="Step 3" :icon="Picture" />
  </te-steps>
</template>

<script lang="ts" setup>
import { Edit, Picture, Upload } from '@element-plus/icons-vue'
</script>
