<template>
  <te-container class="layout-container-demo" style="height: 500px">
    <te-aside width="200px">
      <el-scrollbar>
        <te-menu :default-openeds="['1', '3']">
          <te-sub-menu index="1">
            <template #title>
              <el-icon><message /></el-icon>Navigator One
            </template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <te-menu-item index="1-1">Option 1</el-menu-item>
              <te-menu-item index="1-2">Option 2</el-menu-item>
            </el-menu-item-group>
            <te-menu-item-group title="Group 2">
              <te-menu-item index="1-3">Option 3</el-menu-item>
            </el-menu-item-group>
            <te-sub-menu index="1-4">
              <template #title>Option4</template>
              <te-menu-item index="1-4-1">Option 4-1</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <te-sub-menu index="2">
            <template #title>
              <el-icon><icon-menu /></el-icon>Navigator Two
            </template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <te-menu-item index="2-1">Option 1</el-menu-item>
              <te-menu-item index="2-2">Option 2</el-menu-item>
            </el-menu-item-group>
            <te-menu-item-group title="Group 2">
              <te-menu-item index="2-3">Option 3</el-menu-item>
            </el-menu-item-group>
            <te-sub-menu index="2-4">
              <template #title>Option 4</template>
              <te-menu-item index="2-4-1">Option 4-1</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <te-sub-menu index="3">
            <template #title>
              <el-icon><setting /></el-icon>Navigator Three
            </template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <te-menu-item index="3-1">Option 1</el-menu-item>
              <te-menu-item index="3-2">Option 2</el-menu-item>
            </el-menu-item-group>
            <te-menu-item-group title="Group 2">
              <te-menu-item index="3-3">Option 3</el-menu-item>
            </el-menu-item-group>
            <te-sub-menu index="3-4">
              <template #title>Option 4</template>
              <te-menu-item index="3-4-1">Option 4-1</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <te-header style="text-align: right; font-size: 12px">
        <div class="toolbar">
          <el-dropdown>
            <te-icon style="margin-right: 8px; margin-top: 1px"
              ><setting
            /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>View</el-dropdown-item>
                <el-dropdown-item>Add</el-dropdown-item>
                <el-dropdown-item>Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>Tom</span>
        </div>
      </el-header>

      <el-main>
        <el-scrollbar>
          <te-table :data="tableData">
            <te-table-column prop="date" label="Date" width="140" />
            <te-table-column prop="name" label="Name" width="120" />
            <te-table-column prop="address" label="Address" />
          </el-table>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'

const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
const tableData = ref(Array.from({ length: 20 }).fill(item))
</script>

<style scoped>
.layout-container-demo .te-header {
  position: relative;
  background-color: var(--te-color-primary-light-7);
  color: var(--te-text-color-primary);
}
.layout-container-demo .te-aside {
  color: var(--te-text-color-primary);
  background: var(--te-color-primary-light-8);
}
.layout-container-demo .te-menu {
  border-right: none;
}
.layout-container-demo .te-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
