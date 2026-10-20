<template>
  <te-steps :active="active" finish-status="success">
    <te-step title="Step 1" />
    <te-step title="Step 2" />
    <te-step title="Step 3" />
  </te-steps>

  <te-button style="margin-top: 12px" @click="next">Next step</te-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const next = () => {
  if (active.value++ > 2) active.value = 0
}
</script>
