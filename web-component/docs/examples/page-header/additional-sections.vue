<template>
  <te-page-header :icon="null">
    <template #content>
      <div class="flex items-center">
        <te-avatar
          :size="32"
          class="mr-3"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <span class="text-large font-600 mr-3"> Title </span>
        <span class="text-sm mr-2" style="color: var(--te-text-color-regular)">
          Sub title
        </span>
        <el-tag>Default</el-tag>
      </div>
    </template>
    <template #extra>
      <div class="flex items-center">
        <el-button>Print</el-button>
        <te-button type="primary" class="ml-2">Edit</el-button>
      </div>
    </template>
  </te-page-header>
</template>
