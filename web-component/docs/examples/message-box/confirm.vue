<template>
  <te-button text @click="open">Click to open the Message Box</te-button>
</template>

<script lang="ts" setup>
import { TeMessage, TeMessageBox } from '@tiansu/element-plus'

const open = () => {
  TeMessageBox.confirm(
    'proxy will permanently delete the file. Continue?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      TeMessage({
        type: 'success',
        message: 'Delete completed',
      })
    })
    .catch(() => {
      TeMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
}
</script>
