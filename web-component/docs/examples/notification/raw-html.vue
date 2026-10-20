<template>
  <te-button plain @click="open"> Use HTML String </te-button>
</template>

<script lang="ts" setup>
import { TeNotification } from '@tiansu/element-plus'

const open = () => {
  TeNotification({
    title: 'HTML String',
    dangerouslyUseHTMLString: true,
    message: '<strong>This is <i>HTML</i> string</strong>',
  })
}
</script>
