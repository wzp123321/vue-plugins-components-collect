<template>
  <te-button plain @click="open1"> Closes automatically </te-button>
  <te-button plain @click="open2"> Won't close automatically </te-button>
</template>

<script lang="ts" setup>
import { h } from 'vue'
import { TeNotification } from '@tiansu/element-plus'

const open1 = () => {
  TeNotification({
    title: 'Title',
    message: h('i', { style: 'color: teal' }, 'This is a reminder'),
  })
}

const open2 = () => {
  TeNotification({
    title: 'Prompt',
    message: 'This is a message that does not automatically close',
    duration: 0,
  })
}
</script>
