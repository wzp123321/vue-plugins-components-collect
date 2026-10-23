<template>
  <te-dropdown :hide-on-click="false">
    <span class="te-dropdown-link">
      Dropdown List<te-icon class="te-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>Action 1</el-dropdown-item>
        <el-dropdown-item>Action 2</el-dropdown-item>
        <el-dropdown-item>Action 3</el-dropdown-item>
        <te-dropdown-item disabled>Action 4</el-dropdown-item>
        <te-dropdown-item divided>Action 5</el-dropdown-item>
        <te-dropdown-item divided>Action 6</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'
</script>
<style scoped>
.example-showcase .te-dropdown + .te-dropdown {
  margin-left: 15px;
}
.example-showcase .te-dropdown-link {
  cursor: pointer;
  color: var(--te-color-primary);
  display: flex;
  align-items: center;
}
</style>
