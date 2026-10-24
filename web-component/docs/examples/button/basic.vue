<template>
  <te-row class="mb-4">
    <el-button>Default</el-button>
    <te-button type="primary">Primary</el-button>
    <te-button type="success">Success</el-button>
    <te-button type="info">Info</el-button>
    <te-button type="warning">Warning</el-button>
    <te-button type="danger">Danger</el-button>
  </el-row>

  <te-row class="mb-4">
    <te-button plain>Plain</el-button>
    <te-button type="primary" plain>Primary</el-button>
    <te-button type="success" plain>Success</el-button>
    <te-button type="info" plain>Info</el-button>
    <te-button type="warning" plain>Warning</el-button>
    <te-button type="danger" plain>Danger</el-button>
  </el-row>

  <te-row class="mb-4">
    <te-button round>Round</el-button>
    <te-button type="primary" round>Primary</el-button>
    <te-button type="success" round>Success</el-button>
    <te-button type="info" round>Info</el-button>
    <te-button type="warning" round>Warning</el-button>
    <te-button type="danger" round>Danger</el-button>
  </el-row>

  <el-row>
    <te-button :icon="Search" circle />
    <te-button type="primary" :icon="Edit" circle />
    <te-button type="success" :icon="Check" circle />
    <te-button type="info" :icon="Message" circle />
    <te-button type="warning" :icon="Star" circle />
    <te-button type="danger" :icon="Delete" circle />
  </el-row>
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
