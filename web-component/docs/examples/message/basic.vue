<template>
  <te-button :plain="true" @click="open">Show message</te-button>
  <te-button :plain="true" @click="openVn">VNode</te-button>
</template>

<script lang="ts" setup>
import { h } from 'vue'
import { TeMessage } from '@tiansu/element-plus'

const open = () => {
  TeMessage('this is a message.')
}

const openVn = () => {
  TeMessage({
    message: h('p', null, [
      h('span', null, 'Message can be '),
      h('i', { style: 'color: teal' }, 'VNode'),
    ]),
  })
}
</script>
