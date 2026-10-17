<script setup lang="ts">
// 日期单元格编辑器：基于 element-plus el-date-picker
const model = defineModel<string>();
</script>

<template>
  <el-date-picker
    v-model="model"
    type="date"
    value-format="YYYY-MM-DD"
    size="small"
    class="dt-el-editor"
    style="width: 100%"
  />
</template>
