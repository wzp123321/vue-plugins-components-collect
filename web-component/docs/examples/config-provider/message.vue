<template>
  <div>
    <te-config-provider :message="config">
      <te-button @click="open">OPEN</te-button>
    </te-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { TeMessage } from '@tiansu/element-plus'
const config = reactive({
  max: 3,
})
const open = () => {
  TeMessage('This is a message.')
}
</script>
