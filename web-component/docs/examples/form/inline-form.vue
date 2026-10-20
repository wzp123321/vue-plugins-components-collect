<template>
  <te-form :inline="true" :model="formInline" class="demo-form-inline">
    <te-form-item label="Approved by">
      <te-input v-model="formInline.user" placeholder="Approved by" />
    </te-form-item>
    <te-form-item label="Activity zone">
      <te-select v-model="formInline.region" placeholder="Activity zone">
        <te-option label="Zone one" value="shanghai" />
        <te-option label="Zone two" value="beijing" />
      </te-select>
    </te-form-item>
    <te-form-item>
      <te-button type="primary" @click="onSubmit">Query</te-button>
    </te-form-item>
  </te-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const formInline = reactive({
  user: '',
  region: '',
})

const onSubmit = () => {
  console.log('submit!')
}
</script>
