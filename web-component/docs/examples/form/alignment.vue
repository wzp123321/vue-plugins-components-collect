<template>
  <te-radio-group v-model="labelPosition" label="label position">
    <te-radio-button label="left">Left</te-radio-button>
    <te-radio-button label="right">Right</te-radio-button>
    <te-radio-button label="top">Top</te-radio-button>
  </te-radio-group>
  <div style="margin: 20px" />
  <te-form
    :label-position="labelPosition"
    label-width="100px"
    :model="formLabelAlign"
    style="max-width: 460px"
  >
    <te-form-item label="Name">
      <te-input v-model="formLabelAlign.name" />
    </te-form-item>
    <te-form-item label="Activity zone">
      <te-input v-model="formLabelAlign.region" />
    </te-form-item>
    <te-form-item label="Activity form">
      <te-input v-model="formLabelAlign.type" />
    </te-form-item>
  </te-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const labelPosition = ref('right')

const formLabelAlign = reactive({
  name: '',
  region: '',
  type: '',
})
</script>
