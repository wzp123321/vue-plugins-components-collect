<template>
  <div class="flex flex-wrap items-center">
    <te-dropdown>
      <te-button type="primary">
        Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
      </te-button>
      <template #dropdown>
        <te-dropdown-menu>
          <te-dropdown-item>Action 1</te-dropdown-item>
          <te-dropdown-item>Action 2</te-dropdown-item>
          <te-dropdown-item>Action 3</te-dropdown-item>
          <te-dropdown-item>Action 4</te-dropdown-item>
          <te-dropdown-item>Action 5</te-dropdown-item>
        </te-dropdown-menu>
      </template>
    </te-dropdown>
    <te-dropdown split-button type="primary" @click="handleClick">
      Dropdown List
      <template #dropdown>
        <te-dropdown-menu>
          <te-dropdown-item>Action 1</te-dropdown-item>
          <te-dropdown-item>Action 2</te-dropdown-item>
          <te-dropdown-item>Action 3</te-dropdown-item>
          <te-dropdown-item>Action 4</te-dropdown-item>
          <te-dropdown-item>Action 5</te-dropdown-item>
        </te-dropdown-menu>
      </template>
    </te-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'

const handleClick = () => {
  // eslint-disable-next-line no-alert
  alert('button click')
}
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
