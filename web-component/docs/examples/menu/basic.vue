<template>
  <te-menu
    :default-active="activeIndex"
    class="te-menu-demo"
    mode="horizontal"
    @select="handleSelect"
  >
    <te-menu-item index="1">Processing Center</te-menu-item>
    <te-sub-menu index="2">
      <template #title>Workspace</template>
      <te-menu-item index="2-1">item one</te-menu-item>
      <te-menu-item index="2-2">item two</te-menu-item>
      <te-menu-item index="2-3">item three</te-menu-item>
      <te-sub-menu index="2-4">
        <template #title>item four</template>
        <te-menu-item index="2-4-1">item one</te-menu-item>
        <te-menu-item index="2-4-2">item two</te-menu-item>
        <te-menu-item index="2-4-3">item three</te-menu-item>
      </te-sub-menu>
    </te-sub-menu>
    <te-menu-item index="3" disabled>Info</te-menu-item>
    <te-menu-item index="4">Orders</te-menu-item>
  </te-menu>
  <div class="h-6" />
  <te-menu
    :default-active="activeIndex2"
    class="te-menu-demo"
    mode="horizontal"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleSelect"
  >
    <te-menu-item index="1">Processing Center</te-menu-item>
    <te-sub-menu index="2">
      <template #title>Workspace</template>
      <te-menu-item index="2-1">item one</te-menu-item>
      <te-menu-item index="2-2">item two</te-menu-item>
      <te-menu-item index="2-3">item three</te-menu-item>
      <te-sub-menu index="2-4">
        <template #title>item four</template>
        <te-menu-item index="2-4-1">item one</te-menu-item>
        <te-menu-item index="2-4-2">item two</te-menu-item>
        <te-menu-item index="2-4-3">item three</te-menu-item>
      </te-sub-menu>
    </te-sub-menu>
    <te-menu-item index="3" disabled>Info</te-menu-item>
    <te-menu-item index="4">Orders</te-menu-item>
  </te-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const activeIndex2 = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
