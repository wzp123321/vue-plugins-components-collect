<template>
  <te-popover :visible="visible" placement="top" :width="160">
    <p>Are you sure to delete this?</p>
    <div style="text-align: right; margin: 0">
      <te-button size="small" text @click="visible = false">cancel</el-button>
      <te-button size="small" type="primary" @click="visible = false"
        >confirm</te-button
      >
    </div>
    <template #reference>
      <te-button @click="visible = true">Delete</el-button>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
