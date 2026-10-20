<template>
  <te-button plain @click="open1"> Top Right </te-button>
  <te-button plain @click="open2"> Bottom Right </te-button>
  <te-button plain @click="open3"> Bottom Left </te-button>
  <te-button plain @click="open4"> Top Left </te-button>
</template>

<script lang="ts" setup>
import { TeNotification } from '@tiansu/element-plus'

const open1 = () => {
  TeNotification({
    title: 'Custom Position',
    message: "I'm at the top right corner",
  })
}

const open2 = () => {
  TeNotification({
    title: 'Custom Position',
    message: "I'm at the bottom right corner",
    position: 'bottom-right',
  })
}

const open3 = () => {
  TeNotification({
    title: 'Custom Position',
    message: "I'm at the bottom left corner",
    position: 'bottom-left',
  })
}

const open4 = () => {
  TeNotification({
    title: 'Custom Position',
    message: "I'm at the top left corner",
    position: 'top-left',
  })
}
</script>
