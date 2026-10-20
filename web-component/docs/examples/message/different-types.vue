<template>
  <te-button :plain="true" @click="open2">success</te-button>
  <te-button :plain="true" @click="open3">warning</te-button>
  <te-button :plain="true" @click="open1">message</te-button>
  <te-button :plain="true" @click="open4">error</te-button>
</template>

<script lang="ts" setup>
import { TeMessage } from '@tiansu/element-plus'

const open1 = () => {
  TeMessage('this is a message.')
}
const open2 = () => {
  TeMessage({
    message: 'Congrats, this is a success message.',
    type: 'success',
  })
}
const open3 = () => {
  TeMessage({
    message: 'Warning, this is a warning message.',
    type: 'warning',
  })
}
const open4 = () => {
  TeMessage.error('Oops, this is a error message.')
}
</script>
