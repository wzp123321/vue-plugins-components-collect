<template>
  <te-row>
    <te-button size="large">Large</te-button>
    <te-button>Default</te-button>
    <te-button size="small">Small</te-button>
    <te-button size="large" :icon="Search">Search</te-button>
    <te-button :icon="Search">Search</te-button>
    <te-button size="small" :icon="Search">Search</te-button>
  </te-row>
  <te-row class="my-4">
    <te-button size="large" round>Large</te-button>
    <te-button round>Default</te-button>
    <te-button size="small" round>Small</te-button>
    <te-button size="large" :icon="Search" round>Search</te-button>
    <te-button :icon="Search" round>Search</te-button>
    <te-button size="small" :icon="Search" round>Search</te-button>
  </te-row>
  <te-row>
    <te-button :icon="Search" size="large" circle />
    <te-button :icon="Search" circle />
    <te-button :icon="Search" size="small" circle />
  </te-row>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
</script>
