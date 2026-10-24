<template>
  <te-dropdown @command="handleCommand">
    <span class="te-dropdown-link">
      Dropdown List<te-icon class="te-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <te-dropdown-item command="a">Action 1</el-dropdown-item>
        <te-dropdown-item command="b">Action 2</el-dropdown-item>
        <te-dropdown-item command="c">Action 3</el-dropdown-item>
        <te-dropdown-item command="d" disabled>Action 4</el-dropdown-item>
        <te-dropdown-item command="e" divided>Action 5</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const handleCommand = (command: string | number | object) => {
  ElMessage(`click on item ${command}`)
}
</script>
<style scoped>
.example-showcase .te-dropdown-link {
  cursor: pointer;
  color: var(--te-color-primary);
  display: flex;
  align-items: center;
}
</style>
