<template>
  <p>Basic text button</p>
  <div class="flex justify-space-between mb-4 flex-wrap gap-4">
    <te-button
      v-for="button in buttons"
      :key="button.text"
      :type="button.type"
      text
      >{{ button.text }}</te-button
    >
  </div>

  <p>Background color always on</p>
  <div class="flex justify-space-between mb-4 flex-wrap gap-4">
    <te-button
      v-for="button in buttons"
      :key="button.text"
      :type="button.type"
      text
      bg
      >{{ button.text }}</te-button
    >
  </div>

  <p>Disabled text button</p>
  <div class="flex justify-space-between flex-wrap gap-4">
    <te-button
      v-for="button in buttons"
      :key="button.text"
      :type="button.type"
      text
      disabled
      >{{ button.text }}</te-button
    >
  </div>
</template>

<script setup lang="ts">
const buttons = [
  { type: '', text: 'plain' },
  { type: 'primary', text: 'primary' },
  { type: 'success', text: 'success' },
  { type: 'info', text: 'info' },
  { type: 'warning', text: 'warning' },
  { type: 'danger', text: 'danger' },
] as const
</script>
