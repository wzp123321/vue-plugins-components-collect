<template>
  <div class="flex">
    <te-button type="primary" :icon="Edit" />
    <te-button type="primary" :icon="Share" />
    <te-button type="primary" :icon="Delete" />
    <te-button type="primary" :icon="Search">Search</te-button>
    <te-button type="primary">
      Upload<te-icon class="te-icon--right"><Upload /></te-icon>
    </te-button>
  </div>
</template>
<script setup lang="ts">
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
</script>
