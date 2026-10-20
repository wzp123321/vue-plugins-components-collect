<template>
  <te-button plain @click="open1"> Success </te-button>
  <te-button plain @click="open2"> Warning </te-button>
  <te-button plain @click="open3"> Info </te-button>
  <te-button plain @click="open4"> Error </te-button>
</template>

<script lang="ts" setup>
import { TeNotification } from '@tiansu/element-plus'

const open1 = () => {
  TeNotification({
    title: 'Success',
    message: 'This is a success message',
    type: 'success',
  })
}

const open2 = () => {
  TeNotification({
    title: 'Warning',
    message: 'This is a warning message',
    type: 'warning',
  })
}

const open3 = () => {
  TeNotification({
    title: 'Info',
    message: 'This is an info message',
    type: 'info',
  })
}

const open4 = () => {
  TeNotification({
    title: 'Error',
    message: 'This is an error message',
    type: 'error',
  })
}
</script>
