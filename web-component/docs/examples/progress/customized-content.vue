<template>
  <div class="demo-progress">
    <te-progress :percentage="50">
      <te-button text>Content</te-button>
    </te-progress>
    <te-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="50"
      status="exception"
    >
      <span>Content</span>
    </te-progress>
    <te-progress type="circle" :percentage="100" status="success">
      <te-button type="success" :icon="Check" circle />
    </te-progress>
    <te-progress type="dashboard" :percentage="80">
      <template #default="{ percentage }">
        <span class="percentage-value">{{ percentage }}%</span>
        <span class="percentage-label">Progressing</span>
      </template>
    </te-progress>
  </div>
</template>

<script lang="ts" setup>
import { Check } from '@element-plus/icons-vue'
</script>

<style scoped>
.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}
.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}
.demo-progress .te-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
.demo-progress .te-progress--circle {
  margin-right: 15px;
}
</style>
