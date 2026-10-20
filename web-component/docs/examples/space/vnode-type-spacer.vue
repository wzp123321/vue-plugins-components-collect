<template>
  <te-space :size="size" :spacer="spacer">
    <div v-for="i in 2" :key="i">
      <te-button> button {{ i }} </te-button>
    </div>
  </te-space>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { TeDivider } from '@tiansu/element-plus'

const size = ref(10)
const spacer = h(TeDivider, { direction: 'vertical' })
</script>
