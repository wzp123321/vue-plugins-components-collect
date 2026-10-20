<template>
  <div>
    <te-check-tag checked style="margin-right: 8px">Checked</te-check-tag>
    <te-check-tag :checked="checked" @change="onChange">Toggle me</te-check-tag>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked = ref(false)

const onChange = (status: boolean) => {
  checked.value = status
}
</script>
