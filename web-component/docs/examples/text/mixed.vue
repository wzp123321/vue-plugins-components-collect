<template>
  <te-space direction="vertical">
    <el-text>
      <el-icon>
        <ElementPlus />
      </el-icon>
      Element-Plus
    </el-text>
    <el-row>
      <el-text>Rate</el-text>
      <te-rate class="ml-1" />
    </el-row>
    <el-text>
      This is text mixed icon
      <el-icon>
        <Bell />
      </el-icon>
      and component
      <el-button>Button</el-button>
    </el-text>
  </te-space>
</template>

<script lang="ts" setup>
import { Bell, ElementPlus } from '@element-plus/icons-vue'
</script>
