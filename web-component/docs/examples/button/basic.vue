<template>
  <te-row class="mb-4">
    <te-button>Default</te-button>
    <te-button type="primary">Primary</te-button>
    <te-button type="success">Success</te-button>
    <te-button type="info">Info</te-button>
    <te-button type="warning">Warning</te-button>
    <te-button type="danger">Danger</te-button>
  </te-row>

  <te-row class="mb-4">
    <te-button plain>Plain</te-button>
    <te-button type="primary" plain>Primary</te-button>
    <te-button type="success" plain>Success</te-button>
    <te-button type="info" plain>Info</te-button>
    <te-button type="warning" plain>Warning</te-button>
    <te-button type="danger" plain>Danger</te-button>
  </te-row>

  <te-row class="mb-4">
    <te-button round>Round</te-button>
    <te-button type="primary" round>Primary</te-button>
    <te-button type="success" round>Success</te-button>
    <te-button type="info" round>Info</te-button>
    <te-button type="warning" round>Warning</te-button>
    <te-button type="danger" round>Danger</te-button>
  </te-row>

  <te-row>
    <te-button :icon="Search" circle />
    <te-button type="primary" :icon="Edit" circle />
    <te-button type="success" :icon="Check" circle />
    <te-button type="info" :icon="Message" circle />
    <te-button type="warning" :icon="Star" circle />
    <te-button type="danger" :icon="Delete" circle />
  </te-row>
</template>

<script lang="ts" setup>
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'
</script>
