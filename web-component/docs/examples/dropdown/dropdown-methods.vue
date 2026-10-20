<template>
  <div style="font-size: 14px">
    <p>open(close) the Dropdown list2 will close(open) the Dropdown List1.</p>
  </div>
  <div style="margin: 15px">
    <te-button @click="showClick">show</te-button>
  </div>
  <te-dropdown ref="dropdown1" trigger="contextmenu" style="margin-right: 30px">
    <span class="te-dropdown-link"> Dropdown List1 </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item disabled>Action 4</te-dropdown-item>
        <te-dropdown-item divided>Action 5</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>

  <te-dropdown trigger="contextmenu" @visible-change="handleVisible2">
    <span class="te-dropdown-link"> Dropdown List2 </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item disabled>Action 4</te-dropdown-item>
        <te-dropdown-item divided>Action 5</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DropdownInstance } from '@tiansu/element-plus'

const dropdown1 = ref<DropdownInstance>()
function handleVisible2(visible: any) {
  if (!dropdown1.value) return
  if (visible) {
    dropdown1.value.handleClose()
  } else {
    dropdown1.value.handleOpen()
  }
}
function showClick() {
  if (!dropdown1.value) return
  dropdown1.value.handleOpen()
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
