<script lang="ts" setup>
import { isDark } from '~/composables/dark'
</script>

<template>
  <div class="flex">
    <te-button color="#626aef" :dark="isDark">Default</te-button>
    <te-button color="#626aef" :dark="isDark" plain>Plain</te-button>

    <te-button color="#626aef" :dark="isDark" disabled>Disabled</te-button>
    <te-button color="#626aef" :dark="isDark" disabled plain
      >Disabled Plain</te-button
    >
  </div>
</template>
