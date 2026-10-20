<template>
  <te-button plain @click="openCenter">Centered text</te-button>
</template>

<script lang="ts" setup>
import { TeMessage } from '@tiansu/element-plus'

const openCenter = () => {
  TeMessage({
    showClose: true,
    message: 'Centered text',
    center: true,
  })
}
</script>
