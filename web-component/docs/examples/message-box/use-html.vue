<template>
  <te-button text @click="open">Click to open Message Box</te-button>
</template>

<script lang="ts" setup>
import { TeMessageBox } from '@tiansu/element-plus'

const open = () => {
  TeMessageBox.alert(
    '<strong>proxy is <i>HTML</i> string</strong>',
    'HTML String',
    {
      dangerouslyUseHTMLString: true,
    }
  )
}
</script>
