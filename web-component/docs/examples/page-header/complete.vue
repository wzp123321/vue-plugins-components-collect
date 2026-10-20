<template>
  <div aria-label="A complete example of page header">
    <te-page-header @back="onBack">
      <template #breadcrumb>
        <te-breadcrumb separator="/">
          <te-breadcrumb-item :to="{ path: './page-header.html' }">
            homepage
          </te-breadcrumb-item>
          <te-breadcrumb-item
            ><a href="./page-header.html">route 1</a></te-breadcrumb-item
          >
          <te-breadcrumb-item>route 2</te-breadcrumb-item>
        </te-breadcrumb>
      </template>
      <template #content>
        <div class="flex items-center">
          <te-avatar
            class="mr-3"
            :size="32"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="text-large font-600 mr-3"> Title </span>
          <span
            class="text-sm mr-2"
            style="color: var(--te-text-color-regular)"
          >
            Sub title
          </span>
          <te-tag>Default</te-tag>
        </div>
      </template>
      <template #extra>
        <div class="flex items-center">
          <te-button>Print</te-button>
          <te-button type="primary" class="ml-2">Edit</te-button>
        </div>
      </template>

      <te-descriptions :column="3" size="small" class="mt-4">
        <te-descriptions-item label="Username"
          >kooriookami</te-descriptions-item
        >
        <te-descriptions-item label="Telephone"
          >18100000000</te-descriptions-item
        >
        <te-descriptions-item label="Place">Suzhou</te-descriptions-item>
        <te-descriptions-item label="Remarks">
          <te-tag size="small">School</te-tag>
        </te-descriptions-item>
        <te-descriptions-item label="Address"
          >No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
        </te-descriptions-item>
      </te-descriptions>
      <p class="mt-4 text-sm">
        Element Plus team uses <b>weekly</b> release strategy under normal
        circumstance, but critical bug fixes would require hotfix so the actual
        release number <b>could be</b> more than 1 per week.
      </p>
    </te-page-header>
  </div>
</template>

<script setup lang="ts">
import { TeNotification as notify } from '@tiansu/element-plus'

const onBack = () => {
  notify('Back')
}
</script>
