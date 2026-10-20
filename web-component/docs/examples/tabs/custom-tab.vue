<template>
  <te-tabs type="border-card" class="demo-tabs">
    <te-tab-pane>
      <template #label>
        <span class="custom-tabs-label">
          <te-icon><calendar /></te-icon>
          <span>Route</span>
        </span>
      </template>
      Route
    </te-tab-pane>
    <te-tab-pane label="Config">Config</te-tab-pane>
    <te-tab-pane label="Role">Role</te-tab-pane>
    <te-tab-pane label="Task">Task</te-tab-pane>
  </te-tabs>
</template>

<script lang="ts" setup>
import { Calendar } from '@element-plus/icons-vue'
</script>
<style>
.demo-tabs > .te-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
.demo-tabs .custom-tabs-label .te-icon {
  vertical-align: middle;
}
.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
</style>
