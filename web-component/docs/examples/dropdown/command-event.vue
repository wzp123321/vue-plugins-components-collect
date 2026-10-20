<template>
  <te-dropdown @command="handleCommand">
    <span class="te-dropdown-link">
      Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
    </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item command="a">Action 1</te-dropdown-item>
        <te-dropdown-item command="b">Action 2</te-dropdown-item>
        <te-dropdown-item command="c">Action 3</te-dropdown-item>
        <te-dropdown-item command="d" disabled>Action 4</te-dropdown-item>
        <te-dropdown-item command="e" divided>Action 5</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
</template>

<script lang="ts" setup>
import { TeMessage } from '@tiansu/element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const handleCommand = (command: string | number | object) => {
  TeMessage(`click on item ${command}`)
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
