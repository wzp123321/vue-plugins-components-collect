<script setup lang="ts">
// 文本单元格编辑器：基于 element-plus el-input
const model = defineModel<any>();
</script>

<template>
  <el-input v-model="model" size="small" class="dt-el-editor" />
</template>
