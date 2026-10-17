<script setup lang="ts">
// 下拉单元格编辑器：基于 element-plus el-select
const model = defineModel<any>();
const props = defineProps<{ options?: string[] }>();
</script>

<template>
  <el-select v-model="model" size="small" class="dt-el-editor" style="width: 100%">
    <el-option v-for="o in (props.options || [])" :key="o" :label="o" :value="o" />
  </el-select>
</template>
