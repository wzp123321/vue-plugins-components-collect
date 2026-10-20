<template>
  <te-button-group>
    <te-button type="primary" :icon="ArrowLeft">Previous Page</te-button>
    <te-button type="primary">
      Next Page<te-icon class="te-icon--right"><ArrowRight /></te-icon>
    </te-button>
  </te-button-group>

  <te-button-group class="ml-4">
    <te-button type="primary" :icon="Edit" />
    <te-button type="primary" :icon="Share" />
    <te-button type="primary" :icon="Delete" />
  </te-button-group>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Edit,
  Share,
} from '@element-plus/icons-vue'
</script>
