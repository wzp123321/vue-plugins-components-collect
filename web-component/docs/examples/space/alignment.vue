<template>
  <div class="alignment-container">
    <te-space>
      string
      <el-button> button </el-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
  <div class="alignment-container">
    <te-space alignment="flex-start">
      string
      <el-button> button </el-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
  <div class="alignment-container">
    <te-space alignment="flex-end">
      string
      <el-button> button </el-button>
      <te-card>
        <template #header> header </template>
        body
      </te-card>
    </te-space>
  </div>
</template>

<style>
.alignment-container {
  width: 240px;
  margin-bottom: 20px;
  padding: 8px;
  border: 1px solid var(--te-border-color);
}
</style>
