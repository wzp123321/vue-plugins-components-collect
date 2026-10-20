<template>
  <te-button :plain="true" @click="openHTML">Use HTML String</te-button>
</template>

<script lang="ts" setup>
import { TeMessage } from '@tiansu/element-plus'

const openHTML = () => {
  TeMessage({
    dangerouslyUseHTMLString: true,
    message: '<strong>This is <i>HTML</i> string</strong>',
  })
}
</script>
