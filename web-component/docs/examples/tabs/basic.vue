<template>
  <te-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
    <te-tab-pane label="User" name="first">User</el-tab-pane>
    <te-tab-pane label="Config" name="second">Config</el-tab-pane>
    <te-tab-pane label="Role" name="third">Role</el-tab-pane>
    <te-tab-pane label="Task" name="fourth">Task</el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'

const activeName = ref('first')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>
<style>
.demo-tabs > .te-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
