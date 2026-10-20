<template>
  <te-button plain @click="open"> Notification with offset </te-button>
</template>

<script lang="ts" setup>
import { TeNotification } from '@tiansu/element-plus'

const open = () => {
  TeNotification.success({
    title: 'Success',
    message: 'This is a success message',
    offset: 100,
  })
}
</script>
