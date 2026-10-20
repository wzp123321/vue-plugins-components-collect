<template>
  <te-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <te-radio-button :label="false">expand</te-radio-button>
    <te-radio-button :label="true">collapse</te-radio-button>
  </te-radio-group>
  <te-menu
    default-active="2"
    class="te-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
  >
    <te-sub-menu index="1">
      <template #title>
        <te-icon><location /></te-icon>
        <span>Navigator One</span>
      </template>
      <te-menu-item-group>
        <template #title><span>Group One</span></template>
        <te-menu-item index="1-1">item one</te-menu-item>
        <te-menu-item index="1-2">item two</te-menu-item>
      </te-menu-item-group>
      <te-menu-item-group title="Group Two">
        <te-menu-item index="1-3">item three</te-menu-item>
      </te-menu-item-group>
      <te-sub-menu index="1-4">
        <template #title><span>item four</span></template>
        <te-menu-item index="1-4-1">item one</te-menu-item>
      </te-sub-menu>
    </te-sub-menu>
    <te-menu-item index="2">
      <te-icon><icon-menu /></te-icon>
      <template #title>Navigator Two</template>
    </te-menu-item>
    <te-menu-item index="3" disabled>
      <te-icon><document /></te-icon>
      <template #title>Navigator Three</template>
    </te-menu-item>
    <te-menu-item index="4">
      <te-icon><setting /></te-icon>
      <template #title>Navigator Four</template>
    </te-menu-item>
  </te-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.te-menu-vertical-demo:not(.te-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
