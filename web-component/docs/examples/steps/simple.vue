<template>
  <te-steps :space="200" :active="1" simple>
    <te-step title="Step 1" :icon="Edit" />
    <te-step title="Step 2" :icon="UploadFilled" />
    <te-step title="Step 3" :icon="Picture" />
  </te-steps>

  <te-steps :active="1" finish-status="success" simple style="margin-top: 20px">
    <te-step title="Step 1" />
    <te-step title="Step 2" />
    <te-step title="Step 3" />
  </te-steps>
</template>

<script lang="ts" setup>
import { Edit, Picture, UploadFilled } from '@element-plus/icons-vue'
</script>
