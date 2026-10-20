<template>
  <te-button text @click="open">Click to open Message Box</te-button>
</template>

<script lang="ts" setup>
import { markRaw } from 'vue'
import { TeMessageBox } from '@tiansu/element-plus'
import { Delete } from '@element-plus/icons-vue'

const open = () => {
  TeMessageBox.confirm(
    'It will permanently delete the file. Continue?',
    'Warning',
    {
      type: 'warning',
      icon: markRaw(Delete),
    }
  )
}
</script>
