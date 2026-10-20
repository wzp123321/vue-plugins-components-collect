<template>
  <te-row class="block-col-2">
    <te-col :span="8">
      <span class="demonstration">hover to trigger</span>
      <te-dropdown>
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
        </span>
        <template #dropdown>
          <te-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</te-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </te-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</te-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</te-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</te-dropdown-item>
          </te-dropdown-menu>
        </template>
      </te-dropdown>
    </te-col>
    <te-col :span="8">
      <span class="demonstration">click to trigger</span>
      <te-dropdown trigger="click">
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
        </span>
        <template #dropdown>
          <te-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</te-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </te-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</te-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</te-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</te-dropdown-item>
          </te-dropdown-menu>
        </template>
      </te-dropdown>
    </te-col>
    <te-col :span="8">
      <span class="demonstration">right click to trigger</span>
      <te-dropdown trigger="contextmenu">
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></te-icon>
        </span>
        <template #dropdown>
          <te-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</te-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </te-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</te-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</te-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</te-dropdown-item>
          </te-dropdown-menu>
        </template>
      </te-dropdown>
    </te-col>
  </te-row>
</template>

<script lang="ts" setup>
import {
  ArrowDown,
  Check,
  CircleCheck,
  CirclePlus,
  CirclePlusFilled,
  Plus,
} from '@element-plus/icons-vue'
</script>

<style scoped>
.block-col-2 .demonstration {
  display: block;
  color: var(--te-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
