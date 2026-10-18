<script setup lang="ts">
// 文本单元格编辑器：基于 element-plus el-input
// 角色：cells/index.ts 把本组件注册为 vxe 的 'dt-el-text' 编辑渲染器；
// 用 defineModel 与 vxe 双向绑定（行字段值的读/写由 index.ts 的 makeEditRenderer 统一负责）。
const model = defineModel<any>();
</script>

<template>
  <!-- ⚠️ 必须带 class="dt-el-editor"：主组件 .dt-el-editor 样式负责去边框/透明底/撑满格高，使编辑器融入单元格 -->
  <el-input v-model="model" size="small" class="dt-el-editor" />
</template>
