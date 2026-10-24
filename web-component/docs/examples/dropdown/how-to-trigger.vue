<template>
  <te-row class="block-col-2">
    <te-col :span="8">
      <span class="demonstration">hover to trigger</span>
      <el-dropdown>
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</el-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </el-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</el-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</el-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>
    <te-col :span="8">
      <span class="demonstration">click to trigger</span>
      <te-dropdown trigger="click">
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</el-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </el-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</el-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</el-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>
    <te-col :span="8">
      <span class="demonstration">right click to trigger</span>
      <te-dropdown trigger="contextmenu">
        <span class="te-dropdown-link">
          Dropdown List<te-icon class="te-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <te-dropdown-item :icon="Plus">Action 1</el-dropdown-item>
            <te-dropdown-item :icon="CirclePlusFilled">
              Action 2
            </el-dropdown-item>
            <te-dropdown-item :icon="CirclePlus">Action 3</el-dropdown-item>
            <te-dropdown-item :icon="Check">Action 4</el-dropdown-item>
            <te-dropdown-item :icon="CircleCheck">Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>
  </el-row>
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
