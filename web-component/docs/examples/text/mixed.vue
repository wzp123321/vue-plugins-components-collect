<template>
  <te-space direction="vertical">
    <te-text>
      <te-icon>
        <ElementPlus />
      </te-icon>
      Element-Plus
    </te-text>
    <te-row>
      <te-text>Rate</te-text>
      <te-rate class="ml-1" />
    </te-row>
    <te-text>
      This is text mixed icon
      <te-icon>
        <Bell />
      </te-icon>
      and component
      <te-button>Button</te-button>
    </te-text>
  </te-space>
</template>

<script lang="ts" setup>
import { Bell, ElementPlus } from '@element-plus/icons-vue'
</script>
