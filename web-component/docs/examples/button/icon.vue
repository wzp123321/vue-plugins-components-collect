<template>
  <div class="flex">
    <te-button type="primary" :icon="Edit" />
    <te-button type="primary" :icon="Share" />
    <te-button type="primary" :icon="Delete" />
    <te-button type="primary" :icon="Search">Search</el-button>
    <te-button type="primary">
      Upload<te-icon class="te-icon--right"><Upload /></el-icon>
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
</script>
