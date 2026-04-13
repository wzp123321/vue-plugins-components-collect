<script setup>
import DefaultTheme from 'vitepress/theme'
import ExamplePlayground from './ExamplePlayground.vue'

const { Layout: DefaultLayout } = DefaultTheme
</script>

<template>
  <DefaultLayout>
    <template #doc-after>
      <ExamplePlayground />
    </template>
  </DefaultLayout>
</template>
