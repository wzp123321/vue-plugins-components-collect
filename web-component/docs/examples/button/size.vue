<template>
  <el-row>
    <te-button size="large">Large</el-button>
    <el-button>Default</el-button>
    <te-button size="small">Small</el-button>
    <te-button size="large" :icon="Search">Search</el-button>
    <te-button :icon="Search">Search</el-button>
    <te-button size="small" :icon="Search">Search</el-button>
  </el-row>
  <te-row class="my-4">
    <te-button size="large" round>Large</el-button>
    <te-button round>Default</el-button>
    <te-button size="small" round>Small</el-button>
    <te-button size="large" :icon="Search" round>Search</el-button>
    <te-button :icon="Search" round>Search</el-button>
    <te-button size="small" :icon="Search" round>Search</el-button>
  </el-row>
  <el-row>
    <te-button :icon="Search" size="large" circle />
    <te-button :icon="Search" circle />
    <te-button :icon="Search" size="small" circle />
  </el-row>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
</script>
