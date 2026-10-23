<template>
  <te-menu
    :default-active="activeIndex"
    class="te-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <te-menu-item index="0">LOGO</el-menu-item>
    <div class="flex-grow" />
    <te-menu-item index="1">Processing Center</el-menu-item>
    <te-sub-menu index="2">
      <template #title>Workspace</template>
      <te-menu-item index="2-1">item one</el-menu-item>
      <te-menu-item index="2-2">item two</el-menu-item>
      <te-menu-item index="2-3">item three</el-menu-item>
      <te-sub-menu index="2-4">
        <template #title>item four</template>
        <te-menu-item index="2-4-1">item one</el-menu-item>
        <te-menu-item index="2-4-2">item two</el-menu-item>
        <te-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.flex-grow {
  flex-grow: 1;
}
</style>
