<script setup lang="ts">
// 数字单元格编辑器：基于 element-plus el-input-number
const model = defineModel<number | null>();
</script>

<template>
  <el-input-number
    v-model="model"
    size="small"
    :controls="false"
    class="dt-el-editor"
    style="width: 100%"
  />
</template>
