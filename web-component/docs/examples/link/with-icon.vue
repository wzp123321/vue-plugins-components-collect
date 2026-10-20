<template>
  <div>
    <te-link :icon="Edit">Edit</te-link>
    <te-link>
      Check<te-icon class="te-icon--right"><icon-view /></te-icon>
    </te-link>
  </div>
</template>

<script setup lang="ts">
import { Edit, View as IconView } from '@element-plus/icons-vue'
</script>

<style scoped>
.te-link {
  margin-right: 8px;
}
</style>
