<template>
  <te-breadcrumb :separator-icon="ArrowRight">
    <te-breadcrumb-item :to="{ path: '/' }">homepage</te-breadcrumb-item>
    <te-breadcrumb-item>promotion management</te-breadcrumb-item>
    <te-breadcrumb-item>promotion list</te-breadcrumb-item>
    <te-breadcrumb-item>promotion detail</te-breadcrumb-item>
  </te-breadcrumb>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
</script>
