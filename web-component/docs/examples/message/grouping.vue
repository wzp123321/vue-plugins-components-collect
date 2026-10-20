<template>
  <te-button :plain="true" @click="open">Show message</te-button>
</template>

<script lang="ts" setup>
import { TeMessage } from '@tiansu/element-plus'

const open = () => {
  TeMessage({
    message: 'this is a message.',
    grouping: true,
    type: 'success',
  })
}
</script>
