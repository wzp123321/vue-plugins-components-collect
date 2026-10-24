<template>
  <te-radio-group v-model="tabPosition" style="margin-bottom: 30px">
    <te-radio-button label="top">top</el-radio-button>
    <te-radio-button label="right">right</el-radio-button>
    <te-radio-button label="bottom">bottom</el-radio-button>
    <te-radio-button label="left">left</el-radio-button>
  </el-radio-group>

  <te-tabs :tab-position="tabPosition" style="height: 200px" class="demo-tabs">
    <te-tab-pane label="User">User</el-tab-pane>
    <te-tab-pane label="Config">Config</el-tab-pane>
    <te-tab-pane label="Role">Role</el-tab-pane>
    <te-tab-pane label="Task">Task</el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const tabPosition = ref('left')
</script>
<style>
.demo-tabs > .te-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.te-tabs--right .te-tabs__content,
.te-tabs--left .te-tabs__content {
  height: 100%;
}
</style>
