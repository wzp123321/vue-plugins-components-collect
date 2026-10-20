<template>
  <te-button text @click="open">Click to open the Message Box</te-button>
</template>

<script lang="ts" setup>
import { TeMessage, TeMessageBox } from '@tiansu/element-plus'
import type { Action } from '@tiansu/element-plus'

const open = () => {
  TeMessageBox.alert('This is a message', 'Title', {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: 'OK',
    callback: (action: Action) => {
      TeMessage({
        type: 'info',
        message: `action: ${action}`,
      })
    },
  })
}
</script>
