<template>
  <te-dropdown :hide-on-click="false">
    <span class="te-dropdown-link">
      Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
    </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item disabled>Action 4</te-dropdown-item>
        <te-dropdown-item divided>Action 5</te-dropdown-item>
        <te-dropdown-item divided>Action 6</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
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
