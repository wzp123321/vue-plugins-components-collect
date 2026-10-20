<template>
  <te-button plain @click="open"> Hide close button </te-button>
</template>

<script lang="ts" setup>
import { TeNotification } from '@tiansu/element-plus'

const open = () => {
  TeNotification.success({
    title: 'Info',
    message: 'This is a message without close button',
    showClose: false,
  })
}
</script>
