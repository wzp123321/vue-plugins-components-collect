<template>
  <te-button text @click="open">Click to open Message Box</te-button>
</template>

<script lang="ts" setup>
import { TeMessage, TeMessageBox } from '@tiansu/element-plus'

const open = () => {
  TeMessageBox.prompt('Please input your e-mail', 'Tip', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern:
      /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
    inputErrorMessage: 'Invalid Email',
  })
    .then(({ value }) => {
      TeMessage({
        type: 'success',
        message: `Your email is:${value}`,
      })
    })
    .catch(() => {
      TeMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
}
</script>
