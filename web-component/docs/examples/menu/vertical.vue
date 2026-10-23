<template>
  <te-row class="tac">
    <te-col :span="12">
      <h5 class="mb-2">Default colors</h5>
      <te-menu
        default-active="2"
        class="te-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
      >
        <te-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Navigator One</span>
          </template>
          <te-menu-item-group title="Group One">
            <te-menu-item index="1-1">item one</el-menu-item>
            <te-menu-item index="1-2">item two</el-menu-item>
          </el-menu-item-group>
          <te-menu-item-group title="Group Two">
            <te-menu-item index="1-3">item three</el-menu-item>
          </el-menu-item-group>
          <te-sub-menu index="1-4">
            <template #title>item four</template>
            <te-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <te-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <te-menu-item index="3" disabled>
          <el-icon><document /></el-icon>
          <span>Navigator Three</span>
        </el-menu-item>
        <te-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item>
      </el-menu>
    </el-col>
    <te-col :span="12">
      <h5 class="mb-2">Custom colors</h5>
      <te-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="te-menu-vertical-demo"
        default-active="2"
        text-color="#fff"
        @open="handleOpen"
        @close="handleClose"
      >
        <te-sub-menu index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Navigator One</span>
          </template>
          <te-menu-item-group title="Group One">
            <te-menu-item index="1-1">item one</el-menu-item>
            <te-menu-item index="1-2">item two</el-menu-item>
          </el-menu-item-group>
          <te-menu-item-group title="Group Two">
            <te-menu-item index="1-3">item three</el-menu-item>
          </el-menu-item-group>
          <te-sub-menu index="1-4">
            <template #title>item four</template>
            <te-menu-item index="1-4-1">item one</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <te-menu-item index="2">
          <el-icon><icon-menu /></el-icon>
          <span>Navigator Two</span>
        </el-menu-item>
        <te-menu-item index="3" disabled>
          <el-icon><document /></el-icon>
          <span>Navigator Three</span>
        </el-menu-item>
        <te-menu-item index="4">
          <el-icon><setting /></el-icon>
          <span>Navigator Four</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
