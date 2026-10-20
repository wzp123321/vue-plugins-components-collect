<template>
  <te-button plain @click="open">Common VNode</te-button>
  <te-button plain @click="open1">Dynamic props</te-button>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { TeMessageBox, TeSwitch } from '@tiansu/element-plus'

const open = () => {
  TeMessageBox({
    title: 'Message',
    message: h('p', null, [
      h('span', null, 'Message can be '),
      h('i', { style: 'color: teal' }, 'VNode'),
    ]),
  })
}

const open1 = () => {
  const checked = ref<boolean | string | number>(false)
  TeMessageBox({
    title: 'Message',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h(TeSwitch, {
        modelValue: checked.value,
        'onUpdate:modelValue': (val: boolean | string | number) => {
          checked.value = val
        },
      }),
  })
}
</script>
